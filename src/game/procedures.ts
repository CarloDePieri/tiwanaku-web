import {
  Board,
  Coord,
  CoordSet,
  Field,
  Group,
  Crop,
  State,
  SerializedBoard,
  BoardSize,
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

// noinspection JSValidateJSDoc,JSUnusedLocalSymbols
/**
 * Pop a random element from an array. If the array is empty, returns null.
 *
 * TODO check if an algorithm built around this instead of shuffle would be faster
 *
 * @param {Array<T>} array - The array to pop from.
 * @return {T | null} A random element popped from the given array, or null if the array is empty.
 */
// @ts-expect-error - unused function, but might be useful in the future
function popRandom<T>(array: Array<T>): T | null {
  if (array.length > 0) {
    // pick a random index and the last one
    const index = Math.floor(Math.random() * array.length)
    const lastIndex = array.length - 1
    // switch the random element with the last one
    ;[array[index], array[lastIndex]] = [array[lastIndex], array[index]]
    // pop the element and return it
    return array.pop()!
  }
  return null
}

// noinspection JSValidateJSDoc
/**
 * Return a copy of the given array shuffled with the Fisher-Yates (also known as Knuth) algorithm.
 *
 * @param {T[]} array - The array to be shuffled.
 * @return {T[]} The shuffled array.
 */
function shuffledCopy<T>(array: T[]): T[] {
  const newArray = array.slice(0)
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
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
        hiddenField: true,
        hiddenCrop: true,
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
            hiddenField: true,
            hiddenCrop: true,
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

/**
 * Try to place a crop in a set of valid coordinates.
 * Returns the new state if a valid configuration is found, null otherwise.
 *
 * @param {State} state - The initial state.
 * @param {Crop} crop - The crop to place.
 * @param {Coord[]} validCoords - The list of valid coordinates where the crop can be placed.
 */
function tryCropPlacement(
  state: State,
  crop: Crop,
  validCoords: Coord[],
): State | null {
  // try every valid coord (from a shuffled list, so the order is random)
  for (const candidateCoord of shuffledCopy(validCoords)) {
    // check if the cell is surrounded by cells of the same crop
    // TODO this can and should probably be optimized
    const isSameCropNear = candidateCoord
      .getNeighbors(state?.board)
      .map((coord) => state?.board.getCell(coord.x, coord.y).crop)
      .some((cellCrop) => cellCrop === crop)
    if (!isSameCropNear) {
      // we found a valid crop placement, return the new state
      return state.getUpdatedState({
        ...state?.board.getCell(candidateCoord.x, candidateCoord.y),
        crop: crop,
      })
    }
  }
  // if we got here no valid candidate was found, return null
  return null
}

/**
 * // TODO
 *
 * @param crop
 * @param state
 * @param groupsIds
 * @param maxInvalidTries
 */
function tryCropSizePlacement(
  crop: Crop,
  state: State,
  groupsIds: number[],
  maxInvalidTries: number,
): State | null {
  let newState: State
  let invalidTries = 0

  // while we haven't tried too many invalid configurations...
  do {
    newState = state
    let doneGroups = 0

    for (const groupId of groupsIds) {
      const validCoords: Coord[] = newState.groups
        .get(groupId)!
        .coords.filter(
          (coord) =>
            newState?.board.getCell(coord.x, coord.y).crop === undefined,
        )

      const candidateState = tryCropPlacement(newState, crop, validCoords)
      if (candidateState !== null) {
        newState = candidateState
        doneGroups++
      } else {
        invalidTries++
        // a crop could not be placed in this group, no need to keep trying
        break
      }
    }

    // if it's a valid configuration, return the state
    if (doneGroups === groupsIds.length) {
      return newState
    }
  } while (invalidTries <= maxInvalidTries)
  // If we got here, we couldn't find a valid configuration
  return null
}

/**
 * A stack of states that keeps track of the number of tries left for each configuration.
 */
class StateGenerator {
  private readonly states: [State, number, string[]][]
  private readonly lives: number
  private readonly maxInvalidTries: number

  constructor(lives: number, maxInvalidTries: number) {
    this.lives = lives
    this.maxInvalidTries = maxInvalidTries
    this.states = []
  }

  // TODO docs
  public generate(state: State): State | null {
    // Start with the initial state
    this.push(state)

    // prepare the groups to grow from there
    const groupsToGrow = Array.from(this.lastState.groups.entries())
      // sort them from smallest to the largest (since the smallest is the hardest to grow)
      .sort((a, b) => a[1].coords.length - b[1].coords.length)
      // map to the groupID and the group length
      .map(([groupId, group]) => [groupId, group.coords.length])

    while (this.isAlive()) {
      if (this.isComplete()) {
        // this is a valid configuration for the whole board, let's return it
        return this.lastState
      }

      const crop = this.nextCrop
      console.log("Trying to grow crop", crop)

      const candidateState = tryCropSizePlacement(
        crop,
        this.lastState,
        groupsToGrow
          // select only the groups that are big enough to grow this crop
          .filter(([, length]) => length >= crop)
          // map to the groupID
          .map(([groupId]) => groupId),
        this.maxInvalidTries,
      )
      if (
        candidateState !== null &&
        !this.lastBlacklist.includes(candidateState.board.hash)
      ) {
        // this is a valid configuration for this crop size, let's add it to the stack
        this.push(candidateState)
        console.log(`Crop ${crop} has grown!`)
      } else {
        // damage the last crop, since it couldn't grow the next one
        console.log(`Crop ${crop} could not grow.`)
        this.damageCrop()
      }
    }
    return null
  }

  private get lastCrop(): Crop {
    return this.states.length as Crop
  }

  private get lastState(): State {
    return this.states[this.states.length - 1][0]
  }

  private get lastBlacklist(): string[] {
    return this.states[this.states.length - 1][2]
  }

  private get nextCrop(): Crop {
    return (this.states.length + 1) as Crop
  }

  private push(state: State): void {
    this.states.push([state, this.lives, []])
  }

  private isComplete(): boolean {
    return this.states.length === 5
  }

  private isAlive(): boolean {
    return this.states.length >= 1
  }

  private damageCrop(): void {
    // damage the last configuration
    const lastIndex = this.states.length - 1
    this.states[lastIndex][1]--
    console.log(`Crop ${this.lastCrop} lose 1 life.`)
    if (this.states[lastIndex][1] === 0) {
      // we tried too many times, destroy the previous configuration...
      const deadState = this.states.pop()
      console.log(`Crop ${this.lastCrop} died.`)

      if (this.isAlive()) {
        if (deadState) {
          // register the hash of the dead state board in the blacklist of its predecessor
          this.states[this.states.length - 1][2].push(deadState[0].board.hash)
        }
        // damage its predecessor
        this.damageCrop()
      }
    }
  }
}

// TODO docs, also explain why a serialized board is returned (both redux and comlink need it serialized)
export function generateBoard(size: BoardSize): SerializedBoard | null {
  // Define the board parameters
  const boardHeight = 5
  const boardWidth = size === "small" ? 5 : 9
  const minGroups = size === "small" ? 6 : 10
  const maxGroups = size === "small" ? 8 : 14

  // Prepare an empty board
  const board = Board.Empty(boardWidth, boardHeight)

  // TODO tune these, it's still too slow on standard boards
  //  it probably needs different tuning based on board size
  const generator = new StateGenerator(10, 10)

  let state: State | null = null
  let invalidTries = 0
  const maxTries = 100

  do {
    state = seedOnes(board, minGroups, maxGroups)
    state = tryToDivideFields(state, 10)
    if (state !== null) {
      state = generator.generate(state)
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
