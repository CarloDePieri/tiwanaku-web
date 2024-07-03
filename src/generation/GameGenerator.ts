import { BoardZoneSelector } from "../game/BaseBoard.ts"
import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"
import { Crop, Field } from "../game/enums.ts"
import { BoardSize, GameBoard, SerializedBoard } from "../game/GameBoard.ts"
import { State } from "./State.ts"
import { StateStack } from "./StateStack.ts"
import {
  getRandomInt,
  getRandomWithPercentage,
  pickRandom,
  shuffledCopy,
} from "./utils.ts"

/**
 * The configuration for the game generation.
 */
export class GameConfig {
  constructor(
    // The width of the board.
    public readonly boardWidth: number,
    // The height of the board.
    public readonly boardHeight: number,
    // The maximum number of times the generation algorithm will try to develop a given step.
    public readonly stepMaxTries: number,
    // The maximum number of times the generation algorithm will try to grow the groups.
    public readonly growGroupsMaxTries: number,
    // The minimum number of groups to generate.
    public readonly minGroups: number,
    // The maximum number of groups to generate.
    public readonly maxGroups: number,
    // The minimum number of hints to generate.
    public readonly minHints: number,
    // The maximum number of hints to generate.
    public readonly maxHints: number,
  ) {}
}

// intermediate type used during the generation of the board to store the result of the group growth
interface GroupGrowthResult {
  state: State
  border: CoordSet
}

/**
 * Class used to generate a board for the game.
 */
export class GameGenerator {
  // Stack used to keep track of failed attempt to develop a particular state of the board
  private stateStack: StateStack

  /**
   * Create a GameGenerator.
   * @param {GameConfig} config - The configuration for the game generation.
   */
  constructor(private readonly config: GameConfig) {
    this.stateStack = new StateStack(this.config.stepMaxTries)
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
    if (availableStrategies.length === 0)
      throw new Error("No growth strategy was provided!")
    for (;;) {
      // pick a random strategy
      const strategy = pickRandom(availableStrategies)!.bind(this)
      // prepare a seeded state
      const seededState = this.seedOnes()

      let invalidTries = 0
      for (;;) {
        const result = strategy(seededState)
        // Some combinations of seeded states and strategies may find difficult
        // to grow the groups, so let's check the result
        if (result) {
          let valid = true
          // Check that the produced state is valid
          for (const cell of result.board.flat()) {
            if (cell.groupId === undefined) {
              valid = false
              break
            }
          }
          if (valid) {
            return result
          }
        }
        // if we got here, either the state was invalid or we couldn't grow the groups
        invalidTries++
        if (invalidTries >= this.config.growGroupsMaxTries) {
          // if we tried too many times, try again from the beginning
          break
        }
      }
    }
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

  /**
   * Plant the given crop in the state.
   * This method will try to plant the crop in the state in all groups that need to be planted.
   * If the crop can't be planted, the method will return null.
   *
   * @param {Crop} crop - The crop to plant.
   * @param {State} state - The state to plant the crop in.
   * @param {number[]} groupsToPlant - The groups that need to be planted.
   * @return {State | null} The updated state, or null if the crop can't be planted.
   * @private
   */
  private plantCrop(
    crop: Crop,
    state: State,
    groupsToPlant: number[],
  ): State | null {
    // for every group that needs to be planted
    for (const groupId of groupsToPlant) {
      // get all the border coordinates
      const borderCoords: Coord[] = shuffledCopy(
        state.groups
          .get(groupId)!
          .filter((coord) => state.getCell(coord.x, coord.y).crop === undefined)
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
  }

  /**
   * Generate a board.
   *
   * @return {State} The generated board.
   */
  public generateBoard(): State {
    for (;;) {
      // make sure to grab a fresh reference to the stack
      const stack = this.stateStack

      // push the first step
      stack.pushValid(this.generateFirstStep())

      // prepare the groupsToPlant (lastState is not undefined since we just pushed the first step)
      const groupsToPlant = Array.from(stack.lastState!.groups.entries())
        // sort them from smallest to the largest (since the smallest is the hardest to grow)
        .sort((a, b) => a[1].size - b[1].size)
        // map to the groupID and the group length
        .map(([groupId, group]) => [groupId, group.size])

      // while the state stack is not empty
      while (!stack.empty) {
        if (stack.full) {
          return stack.lastState!
        }

        // try to plant the next crop
        const candidateState = this.plantCrop(
          stack.nextCrop,
          stack.lastState!,
          groupsToPlant
            // only pass the groups that are big enough to plant the crop
            .filter(([, groupSize]) => groupSize >= stack.nextCrop)
            .map(([groupId]) => groupId),
        )
        // if the candidate state is valid, push it to the stack
        if (candidateState !== null) stack.pushValid(candidateState)
        // otherwise, mark the step as invalid
        else stack.markInvalid()
      }
      // if we got here we failed to generate a board, try again after resetting the stack
      this.stateStack = new StateStack(this.config.stepMaxTries)
    }
  }

  /**
   * Generate the hints for a board.
   *
   * @param {State} board - The board to generate the hints for.
   * @return {CoordSet} The hints for the board.
   */
  public generateHints(board: State): CoordSet {
    let hints = CoordSet.from([])
    const targetHints = getRandomInt(this.config.minHints, this.config.maxHints)
    let tries = 0
    const zones = new BoardZoneSelector(board.board)
    while (hints.size < targetHints && tries < 100) {
      // pick a random zone to place the hints; prefer the border, then the inner ring, then the core
      const zone = getRandomWithPercentage([
        [zones.border, 76],
        [zones.innerRing, 18],
        [zones.core, 6],
      ])
      hints = hints.withCoord(pickRandom(zone)!)
      // keep track of the number of tries, to avoid infinite loops
      tries++
    }
    return hints
  }
}

/**
 * Generate a board of the given size.
 * The board will be generated using the GameGenerator class and then serialized into a JSON-serializable form.
 *
 * @param {BoardSize} boardSize - The size of the board to generate.
 * @return {SerializedBoard} The generated board.
 */
export const generateBoard = (boardSize: BoardSize): SerializedBoard => {
  const isBoardSmall = boardSize === "small"
  // Define the board parameters
  const config = new GameConfig(
    isBoardSmall ? 5 : 9,
    5,
    25,
    5,
    isBoardSmall ? 6 : 10,
    isBoardSmall ? 8 : 14,
    isBoardSmall ? 3 : 5,
    isBoardSmall ? 7 : 12,
  )
  const gameGenerator = new GameGenerator(config)
  const state = gameGenerator.generateBoard()
  const hints = gameGenerator.generateHints(state)
  return GameBoard.fromCompleteState(state, hints).getSerializedBoard()
}
