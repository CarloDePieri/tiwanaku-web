import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"
import { Crop, Field } from "./enums.ts"
import { SerializedBoard, State } from "./State.ts"
import { StateStack } from "./StateStack.ts"
import { pickRandom } from "./utils.ts"

export class GameConfig {
  // TODO document these
  constructor(
    public readonly boardWidth: number,
    public readonly boardHeight: number,
    public readonly stepMaxTries: number,
    public readonly growGroupsMaxTries: number,
    public readonly minGroups: number,
    public readonly maxGroups: number,
  ) {}
}

export class GameController {
  // TODO explain how states are stored
  private stateStack: StateStack

  constructor(private readonly config: GameConfig) {
    this.stateStack = new StateStack(config.stepMaxTries)
  }

  /**
   * Grow the groups of the state using a depth-first strategy.
   * This strategy will try to grow each group orthogonally until the group is
   * full, or it can't grow anymore.
   * The returned state is not guaranteed to have valid groups.
   *
   * @param {State} state - The state to grow the groups of.
   * @return {State | null} The state with the grown groups, or null if the groups could not be grown.
   * @private
   */
  private depthFirstGrowth(state: State): State | null {
    let newState = state
    newState.groups.forEach((_, groupId) => {
      // since the object pointed by newState will change later on,
      // we need a way to get an up-to-date reference to the group
      // since we are in a forEach loop, the group is guaranteed to exist
      const getGroup = () => newState.groups.get(groupId)!
      // this is the set of cells orthogonally adjacent to the border's cells
      let groupBorder: CoordSet
      // these are cells that the group already tried to grow towards
      let groupBlacklist = new CoordSet()

      do {
        const group = getGroup()

        // build the orthogonal border (minus the blacklist)
        groupBorder = group
          .getOrthogonalNeighbors(
            this.config.boardHeight,
            this.config.boardWidth,
          )
          .difference(groupBlacklist)

        // pick a random cell from the border
        const candidateCellCoord: Coord | null = pickRandom(
          groupBorder.toArray(),
        )
        if (candidateCellCoord === null) break

        // if the new cell was not assigned to a group
        if (
          newState.getCell(candidateCellCoord.x, candidateCellCoord.y)
            .groupId === undefined
        ) {
          // produce a list of the new neighboring fields
          const candidateNeighboringField = candidateCellCoord
            .getNeighbors(this.config.boardHeight, this.config.boardWidth)
            // subtract the group itself
            .filter((coord) => !group.has(coord))
            // extract the fields
            .map((coord) => newState.getCell(coord.x, coord.y).field)

          // if the new border does not contain the same field of this group
          if (
            !candidateNeighboringField.some((field) => field === group.field)
          ) {
            // add the cell to the group
            newState = newState.copyWithCell(
              newState
                .getCell(candidateCellCoord.x, candidateCellCoord.y)
                .copyWith({ groupId: groupId, field: group.field }),
            )
          } else {
            // add the cell to the blacklist
            groupBlacklist = groupBlacklist.withCoord(candidateCellCoord)
          }
        } else {
          // add the cell to the blacklist
          groupBlacklist = groupBlacklist.withCoord(candidateCellCoord)
        }
        // and now keep going until either the group is full or it's border is empty
      } while (getGroup().size < 5 && groupBorder.size > 0)
    })
    return newState
  }

  // check if all cells of the board have been assigned to a group
  private hasValidGroups(state: State): boolean {
    for (const cell of state.board.flat()) {
      if (cell.groupId === undefined) return false
    }
    return true
  }

  private growGroups(
    state: State,
    growthStrategy: (state: State) => State | null,
  ): State | null {
    let invalidTries = 0
    for (;;) {
      // try to grow the groups
      const newState = growthStrategy(state)
      // check if the returned state is not null and has valid groups
      if (newState !== null && this.hasValidGroups(newState)) {
        // we found a valid state, return it
        return newState
      } else {
        // keep track of failed attempts
        invalidTries++
        // if we tried too many times, return null
        if (invalidTries >= this.config.growGroupsMaxTries) return null
      }
    }
  }

  private seedOnes(): State {
    // It's always possible to find a valid configuration, so keep trying until we find one
    for (;;) {
      // clean slate for the state
      let state = State.Empty(this.config.boardWidth, this.config.boardHeight)
      // this shuffled coordinates will provide the randomness throughout the process
      let validCoords = state.getBoardCoordinates().copyShuffled()

      // while there are still valid coordinates
      while (validCoords.size > 0) {
        // get the first valid coordinate
        const coord: Coord = validCoords.values().next().value
        // add it to the state
        state = state.copyWithCell(
          state.getCell(coord.x, coord.y).copyWith({
            crop: Crop.one,
            groupId: state.groups.size,
            field: pickRandom(Object.values(Field))!,
          }),
        )
        // subtract the coord and its neighbors from the valid coords
        validCoords = validCoords.difference(
          CoordSet.from(
            coord
              .getNeighbors(this.config.boardHeight, this.config.boardWidth)
              .concat([coord]),
          ),
        )
      }
      // if the group number is within the bounds, return the state
      if (
        state.groups.size >= this.config.minGroups &&
        state.groups.size <= this.config.maxGroups
      )
        return state
    }
  }

  private generateFirstStep(): State | null {
    // TODO choose a random strategy
    return this.growGroups(this.seedOnes(), this.depthFirstGrowth)
  }

  public generateBoard(): SerializedBoard {
    // TODO temporary, implement the actual logic
    const firstStep = this.generateFirstStep()
    if (firstStep !== null) this.stateStack.pushValid(firstStep)

    throw new Error("Not implemented")
  }
}
