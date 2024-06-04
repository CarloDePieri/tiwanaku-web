import {
  Board,
  Coord,
  CoordSet,
  Field,
  Group,
  Crop,
  State,
  SerializedBoard,
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

// noinspection JSValidateJSDoc
/**
 * Shuffles an array using the Fisher-Yates (also known as Knuth) shuffle algorithm.
 *
 * @param {T[]} array - The array to be shuffled.
 * @return {T[]} The shuffled array.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Seed an empty board with ones. This also defines the number of groups.
 *
 * @param board
 * @param minGroups
 * @param maxGroups
 */
function seedOnes(board: Board, minGroups: number, maxGroups: number): State {
  // TODO refactor this, it should use the same logic as the other function for seeding crops
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
        crop: Crop.one,
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
  // TODO break up this function, it's too big
  // TODO try other algorithms to distribute fields, a breath-first approach or a hybrid one (breath with chances to go deep instead)
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
            crop: undefined,
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

interface GroupInfo {
  groupId: number
  length: number
}

function tryCrop(
  crop: Crop,
  state: State,
  groups: GroupInfo[],
  maxInvalidTries: number,
): State | null {
  let newState: State | null = null
  let invalidTries = 0
  let groupsIds: number[]

  do {
    newState = state
    groupsIds = groups.map(({ groupId }) => groupId)
    let doneGroups = 0

    for (const groupId of groupsIds) {
      const validCoords: Coord[] = shuffle(
        newState.groups.get(groupId)!.coords,
      ).filter(
        (coord) => newState?.board.getCell(coord.x, coord.y).crop === undefined,
      )
      let candidateFound = false

      for (const candidateCoord of validCoords) {
        // check if the cell is surrounded by cells of the same crop
        const isSameCropNear = candidateCoord
          .getNeighbors(newState?.board)
          .map((coord) => newState?.board.getCell(coord.x, coord.y).crop)
          .some((cellCrop) => cellCrop === crop)

        if (!isSameCropNear) {
          newState = newState.getUpdatedState({
            ...newState?.board.getCell(candidateCoord.x, candidateCoord.y),
            crop: crop,
          })
          candidateFound = true
          // we found a valid candidate for this group, no need to keep looking
          break
        }
      }

      if (candidateFound) {
        doneGroups++
      } else {
        invalidTries++
        // a crop could not be placed in this group, no need to keep trying
        break
      }
    }

    // if it's a valid configuration, return the state
    if (doneGroups === groups.length) {
      return newState
    }
  } while (invalidTries <= maxInvalidTries)
  // If we got here, we couldn't find a valid configuration
  return null
}

interface Configuration {
  state: State
  lives: number
}

function tryToGrowCrops(
  state: State,
  maxInvalidTries: number,
  configurationLives: number,
): State | null {
  const groupsToGrow: GroupInfo[] = Array.from(state.groups.entries())
    // sort them from largest to smallest
    .sort((a, b) => b[1].coords.length - a[1].coords.length)
    // map to the groupId
    .map(([groupId, group]) => ({
      groupId: groupId,
      length: group.coords.length,
    }))

  // use a stack to keep track of possible configurations
  const configurationStack: Configuration[] = [
    { state: state, lives: configurationLives },
  ]

  while (configurationStack.length > 0) {
    // there's no candidate configuration for this crop size, let's build one
    const currentSize = configurationStack.length

    console.log("Trying to grow crops", currentSize + 1)

    const configState = tryCrop(
      (currentSize + 1) as Crop,
      configurationStack[configurationStack.length - 1].state,
      groupsToGrow.filter(({ length }) => length > currentSize),
      maxInvalidTries,
    )
    // TODO keep a blacklist of dead board hash and check the new config against it

    if (configState !== null) {
      if (currentSize === 5) {
        // we found a valid configuration for the whole board, let's return it
        return configState
      } else {
        console.log(`Crop ${currentSize + 1} has grown!`)
        // we found a valid configuration for the current size, let's add it to the stack
        configurationStack.push({
          state: configState,
          lives: configurationLives,
        })
      }
    } else {
      // we couldn't generate a valid config from the last state, let's keep track of that
      console.log(`Crop ${currentSize + 1} could not grow.`)

      const damageField = () => {
        const currentSize = configurationStack.length
        const lastConfig = configurationStack.length - 1
        configurationStack[lastConfig].lives--
        console.log(`Crop ${currentSize} lose 1 life.`)
        if (configurationStack[lastConfig].lives === 0) {
          console.log(`Crop ${currentSize} died.`)
          // we tried too many times, destroy the previous configuration...
          configurationStack.pop()
          if (configurationStack.length > 0) {
            // ... and damage its previous one
            damageField()
          }
        }
      }
      damageField()
    }
  }
  // if we got here, we couldn't find a valid configuration
  return null
}

// TODO docs, also explain why a serialized board is returned
export function generateBoard(
  size: "small" | "standard",
): SerializedBoard | null {
  // Define the board parameters
  const boardHeight = 5
  const boardWidth = size === "small" ? 5 : 9
  const minGroups = size === "small" ? 6 : 10
  const maxGroups = size === "small" ? 8 : 14

  // Prepare an empty board
  const board = Board.Empty(boardWidth, boardHeight)

  let state: State | null = null
  let invalidTries = 0
  const maxTries = 100

  do {
    state = seedOnes(board, minGroups, maxGroups)
    state = tryToDivideFields(state, 10)
    if (state !== null) {
      // TODO tune these, it's too slow on standard boards
      //  it probably needs different tuning based on board size
      state = tryToGrowCrops(state, 10, 10)
      if (state !== null) {
        console.log(
          `Board generated successfully in ${invalidTries + 1} tries!`,
        )
        return state.board.serialize()
      } else {
        console.log("ERROR > Invalid configuration, trying again...")
        invalidTries++
      }
    }
  } while (invalidTries < maxTries)

  console.log("ERROR > Could not generate a valid board.")
  return null
}
