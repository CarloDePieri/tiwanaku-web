import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"
import { Crop, Field } from "./enums.ts"
import { SerializedBoard, State } from "./State.ts"
import { StateStack } from "./StateStack.ts"
import { pickRandom, shuffledCopy } from "./utils.ts"

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

interface GroupGrowthResult {
  state: State
  border: CoordSet
}

export class GameController {
  // TODO explain how states are stored
  private stateStack: StateStack

  constructor(private readonly config: GameConfig) {
    this.stateStack = new StateStack(config.stepMaxTries)
  }

  /**
   * Generate the first step of the board.
   * It will return a state with the first crop seeded and all cells assigned
   * to a group and a field.
   *
   * @param {((state: State) => State)[]} availableStrategies - The strategies to use to grow the groups.
   * @return {State} The first step of the board.
   * @private
   */
  private generateFirstStep(
    availableStrategies: ((state: State) => State)[] = [
      this.depthFirstGrowth,
      this.breadthFirstGrowth,
    ],
  ): State {
    let state: State | null = null
    if (availableStrategies.length === 0)
      throw new Error("No growth strategy was provided!")
    while (state === null) {
      // pick a random strategy
      const strategy = pickRandom(availableStrategies)!.bind(this)
      // prepare a seeded state
      const seededState = this.seedOnes()
      // Since some combinations of seeded states and strategies may find difficult to grow the groups,
      // tryUntil will return null after a certain number of tries.
      state = this.tryUntil(
        // Try to grow the groups using the given strategy.
        () => strategy(seededState),
        // maximum number of tries before returning null
        this.config.growGroupsMaxTries,
        // use this function to check if the state is valid
        (result) => {
          for (const cell of result.board.flat()) {
            if (cell.groupId === undefined) return false
          }
          return true
        },
      )
    }
    return state
  }

  /**
   * Seed the board with the first crop.
   * This method will return a state with the first crop seeded. Those cells will be
   * assigned to a group and a field.
   *
   * @return {State} The state with the first crop seeded.
   * @private
   */
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

  /**
   * Grow the groups of the state using a depth-first strategy.
   * This strategy will try to grow each group orthogonally until the group is
   * full, or it can't grow anymore.
   * The returned state is not guaranteed to be a valid board (there may be unassigned cells).
   *
   * @param {State} state - The state to grow the groups of.
   * @return {State} The state with the grown groups.
   * @private
   */
  private depthFirstGrowth(state: State): State {
    let newState = state
    newState.groups.forEach((_, groupId) => {
      // compute the first border of the group
      let groupBorder = newState.groups
        .get(groupId)!
        .getOrthogonalNeighbors(this.config.boardHeight, this.config.boardWidth)

      while (this.canGroupGrow(newState, groupId, groupBorder)) {
        // try to grow the group once
        const result = this.growGroupOnce(newState, groupId, groupBorder)
        // keep updating the state and the border until we can't grow anymore
        newState = result.state
        groupBorder = result.border
      }
    })
    return newState
  }

  /**
   * Grow the groups of the state using a breadth-first strategy.
   * This strategy will try to grow all groups gradually, by picking a random cell from the border
   * of each group and trying to grow it.
   * The returned state is not guaranteed to be a valid board (there may be unassigned cells).
   *
   * @param {State} state - The state to grow the groups of.
   * @return {State} The state with the grown groups.
   * @private
   */
  private breadthFirstGrowth(state: State): State {
    // compute all initial group borders
    const groupBorders: Map<number, CoordSet> = new Map(
      [...state.groups.entries()].map(([groupId, group]) => [
        groupId,
        group.getOrthogonalNeighbors(
          this.config.boardHeight,
          this.config.boardWidth,
        ),
      ]),
    )
    // enumerate the groups that can grow
    const growableGroups = Array.from(state.groups.keys())
    let newState = state

    // while there are groups that can grow
    while (growableGroups.length > 0) {
      // iterate over them
      growableGroups.forEach((groupId, groupIndex) => {
        // get the border of the group
        const groupBorder = groupBorders.get(groupId)!
        if (this.canGroupGrow(newState, groupId, groupBorder)) {
          // try to grow the group once
          const result = this.growGroupOnce(newState, groupId, groupBorder)
          // update the state and the border
          newState = result.state
          groupBorders.set(groupId, result.border)
        } else {
          // remove the group from the list of groups that can grow
          growableGroups.splice(groupIndex, 1)
        }
      })
    }

    return newState
  }

  /**
   * Try to grow the group once.
   * This method will try to grow the group by picking a random cell from the border
   * and trying to assign it to the group.
   * If the cell can't be assigned to the group, it will be removed from the border.
   * The method will return the updated state and the updated border.
   * If the group can't grow, the original state and updated border will be returned.
   *
   * @param {State} state - The state to grow the groups of.
   * @param {number} groupId - The id of the group to grow.
   * @param {CoordSet} groupBorder - The border of the group to grow.
   * @return {GroupGrowthResult} The updated state and border.
   * @private
   */
  private growGroupOnce(
    state: State,
    groupId: number,
    groupBorder: CoordSet,
  ): GroupGrowthResult {
    const group = state.groups.get(groupId)!

    do {
      // make sure the border can grow
      if (groupBorder.size === 0) break

      // pick a random cell from the border
      const candidateCellCoord: Coord = pickRandom(groupBorder.toArray())!

      // if the new cell was not assigned to a group
      if (
        state.getCell(candidateCellCoord.x, candidateCellCoord.y).groupId ===
        undefined
      ) {
        // produce a list of the new neighboring fields
        const candidateNeighboringField = candidateCellCoord
          .getNeighbors(this.config.boardHeight, this.config.boardWidth)
          // subtract the group itself
          .filter((coord) => !group.has(coord))
          // extract the fields
          .map((coord) => state.getCell(coord.x, coord.y).field)

        // if the new border does not contain the same field of this group
        if (!candidateNeighboringField.some((field) => field === group.field)) {
          // we managed to grow the group
          return {
            // create a copy of the given state with the updated cell
            state: state.copyWithCell(
              state
                .getCell(candidateCellCoord.x, candidateCellCoord.y)
                .copyWith({ groupId: groupId, field: group.field }),
            ),
            // update the border to include the new cell neighbors
            border: groupBorder.union(
              CoordSet.from(
                candidateCellCoord.getOrthogonalNeighbors(
                  this.config.boardHeight,
                  this.config.boardWidth,
                ),
              ).difference(group),
            ),
          }
        } else {
          // remove the cell from the border
          groupBorder = groupBorder.withoutCoord(candidateCellCoord)
        }
      } else {
        // remove the cell from the border
        groupBorder = groupBorder.withoutCoord(candidateCellCoord)
      }
    } while (groupBorder.size > 0)

    // if we got here we couldn't grow the group, return the originale state and the updated border
    return {
      state,
      border: groupBorder,
    }
  }

  // Check if the given group can grow
  private canGroupGrow(
    state: State,
    groupId: number,
    border: CoordSet,
  ): boolean {
    return state.groups.get(groupId)!.size < 5 && border.size > 0
  }

  private tryUntil<T extends () => State | null>(
    func: T,
    maxTries: number,
    validator?: (result: State) => boolean,
  ): State | null {
    let invalidTries = 0
    for (;;) {
      const result = func()
      if (result !== null)
        if (validator !== undefined) {
          return validator(result) ? result : null
        } else {
          return result
        }
      invalidTries++
      if (invalidTries >= maxTries) return null
    }
  }

  private plantCrop(
    crop: Crop,
    state: State,
    groupsToPlant: number[],
  ): State | null {
    return this.tryUntil(() => {
      // for every group that needs to be planted
      for (const groupId of groupsToPlant) {
        // get all the border coordinates
        const borderCoords: Coord[] = shuffledCopy(
          state.groups
            .get(groupId)!
            .filter(
              (coord) => state.getCell(coord.x, coord.y).crop === undefined,
            )
            .toArray(),
        )
        let cropPlanted = false
        // check those coordinates until we find a suitable place to plant the crop
        while (borderCoords.length > 0) {
          const candidateCoord = borderCoords.pop()!
          const neighboringCrop = candidateCoord
            .getNeighbors(this.config.boardHeight, this.config.boardWidth)
            .map((coord) => state.getCell(coord.x, coord.y).crop)
          // check if the crop can be planted there
          if (!neighboringCrop.includes(crop)) {
            // plant the crop
            state = state.copyWithCell(
              state.getCell(candidateCoord.x, candidateCoord.y).copyWith({
                crop,
              }),
            )
            cropPlanted = true
            // interrupt the search for this group
            break
          }
        }
        // if a group could not be placed at all, return null
        if (!cropPlanted) return null
      }
      // if we got here, all groups have been planted
      return state
    }, this.config.stepMaxTries)
  }

  public generateBoard(): SerializedBoard {
    const firstStep = this.generateFirstStep()
    this.stateStack.pushValid(firstStep)
    // TODO temporary, implement the actual logic
    const newState = this.plantCrop(
      this.stateStack.nextCrop,
      this.stateStack.lastState,
      [...this.stateStack.lastState.groups.keys()],
    )
    if (newState !== null) this.stateStack.pushValid(newState)

    throw new Error("Not implemented")
  }
}
