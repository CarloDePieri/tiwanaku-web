import { Board, Group, Size, State } from "./structures.ts"

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
    let validCells = board
      .get()
      .flat()
      .map((cell) => cell.coordinates)

    // try to generate a configuration
    do {
      const randomCoord = pickRandom(validCells)
      if (randomCoord === null) break

      // add the cell
      candidate = candidate.getUpdatedState({
        coordinates: randomCoord,
        field: undefined,
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

// TODO
export function generateBoard(size: "small" | "standard"): Board {
  // Define the board parameters
  const boardHeight = 5
  const boardWidth = size === "small" ? 5 : 9
  const minGroups = size === "small" ? 6 : 10
  const maxGroups = size === "small" ? 8 : 14

  // Prepare an empty board
  let board = Board.Empty(boardWidth, boardHeight)

  let state = seedOnes(board, minGroups, maxGroups)

  console.log(state)

  return state.board
}
