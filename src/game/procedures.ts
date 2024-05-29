import {
  Board,
  Coord,
  CoordSet,
  Field,
  Group,
  Size,
  State,
} from "./structures.ts"

/**
 * Generate a random integer within a given range.
 *
 * @param {number} min - The lower bound of the range.
 * @param {number} max - The upper bound of the range.
 * @return {number} A random integer within the given range.
 */
const randomIntFromInterval = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min)

// noinspection JSValidateJSDoc
/**
 * Pick a random element from an array. If the array is empty, returns null.
 *
 * @param {Array<T>} array - The array to pick from.
 * @return {T | null} A random element from the given array, or null if the array is empty.
 */
function pickRandom<T>(array: Array<T>): T | null {
  return array.length === 0
    ? null
    : array[Math.floor(Math.random() * array.length)]
}

/**
 * Seed an empty board with ones. This also defines the number of groups.
 *
 * @param board
 * @param minGroups
 * @param maxGroups
 */
function seedOnes(board: Board, minGroups: number, maxGroups: number): State {
  let candidate: State

  // Keep trying until the number of groups is within the desired range
  // This will discard configuration where there are not enough groups to fill the board
  do {
    // reset the state
    candidate = new State(board, new Map<number, Group>())

    // define a target number of groups
    let groupsLeft = randomIntFromInterval(minGroups, maxGroups)
    // all cells are valid at the start
    let validCells = board.getBoardCoordinates()

    // try to generate a configuration
    do {
      const randomCoord = pickRandom(validCells)
      if (randomCoord === null) break

      // add the cell
      candidate = candidate.getUpdatedState({
        coordinates: randomCoord,
        field: pickRandom(Object.values(Field))!,
        size: Size.One,
        groupId: candidate.groups.size,
      })

      // update the valid cell for the next one
      validCells = validCells.filter(
        (coord) =>
          !(randomCoord.isNeighborOf(coord) || coord.equals(randomCoord)),
      )

      groupsLeft--
    } while (groupsLeft > 0 && candidate.groups.size <= maxGroups)
  } while (
    candidate.groups.size < minGroups ||
    candidate.groups.size > maxGroups
  )

  return candidate
}

/**
 * Try to grow the groups in the given state.
 *
 * @param {State} state - The initial state.
 * @param {number} maxInvalidTries - How many times the algorithm will try to group groups before giving up.
 * @return {State | null} The new state with the grown groups, or null if a valid configuration could not be found.
 */
function tryToDivideFields(
  state: State,
  maxInvalidTries: number,
): State | null {
  let newState: State
  let validConfig
  let invalidTries = 0

  do {
    // start fresh
    newState = state
    validConfig = false

    // for every group
    newState.groups.forEach((_, groupId) => {
      // this is the set of cells orthogonally adjacent to the border's cells
      let groupBorder: CoordSet
      // these are cells that the group already tried to grow towards
      const groupBlacklist = new CoordSet()
      // get a up-to-date reference to the group. it can't be null since we're in a forEach
      const getGroup = () => newState.groups.get(groupId)!

      do {
        const group = getGroup()
        // build the border (minus the blacklist)
        groupBorder = group
          .getBorderSet(newState.board.height, newState.board.width)
          .difference(groupBlacklist)

        // pick a random cell from the border
        const candidateCell: Coord | null = pickRandom(groupBorder)
        if (candidateCell === null) break

        const candidateBorder = newState.board.getBoardCoordinates().filter(
          (coord) =>
            // pick all cell that are neighbor of the candidate...
            candidateCell.isNeighborOf(coord) &&
            // ... and that are not part of the group itself
            !group.coords.some((c) => c.equals(coord)),
        )
        const neighboringFields = candidateBorder.map(
          (coord) => newState.board.getCell(coord.x, coord.y).field,
        )

        if (
          newState.board.getCell(candidateCell.x, candidateCell.y).groupId ===
            undefined &&
          !neighboringFields.some((field) => field === group.field)
        ) {
          // add it to the state if the cell is empty and would not cause a field conflict
          newState = newState.getUpdatedState({
            groupId: groupId,
            coordinates: candidateCell,
            size: undefined,
            field: group.field,
          })
        } else {
          // otherwise add it to the blacklist
          groupBlacklist.add(candidateCell)
        }
      } while (getGroup().coords.length < 5 && groupBorder.length > 0)
    })

    // check if the configuration managed to assign all cell to a group
    if (
      Array.from(newState.groups.values())
        .map((group: Group) => group.coords.length)
        .reduce((sum, x) => sum + x, 0) ===
      newState.board.height * newState.board.width
    ) {
      validConfig = true
    } else {
      invalidTries++
      if (invalidTries > maxInvalidTries) return null
    }
  } while (!validConfig)

  return newState
}

// TODO
export function generateBoard(size: "small" | "standard"): Board {
  // Define the board parameters
  const boardHeight = 5
  const boardWidth = size === "small" ? 5 : 9
  const minGroups = size === "small" ? 6 : 10
  const maxGroups = size === "small" ? 8 : 14

  // Prepare an empty board
  const board = Board.Empty(boardWidth, boardHeight)

  let state: State | null = null

  do {
    state = seedOnes(board, minGroups, maxGroups)
    state = tryToDivideFields(state, 10)
  } while (state === null)

  console.log(state)

  return state.board
}
