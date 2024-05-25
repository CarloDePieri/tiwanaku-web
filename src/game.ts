import { DeepReadonly } from "ts-essentials"

export enum Field {
  Forest = "forest",
  Desert = "desert",
  Mountain = "mountain",
  Valley = "valley",
}

export enum Size {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
  Five = 5,
}

class Coord {
  readonly x: number
  readonly y: number
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }
  equals(other: Coord): boolean {
    return this.x === other.x && this.y === other.y
  }
  toString(): string {
    return `(${this.x}, ${this.y})`
  }
}

// TODO find a way to make this more efficient, maybe an Hashtable or a Set that actually works with .equals
class CoordSet extends Array<Coord> {
  add(coord: Coord) {
    if (!this.has(coord)) this.push(coord)
  }
  has(coord: Coord) {
    return this.some((c) => c.equals(coord))
  }
}

type Group = ReadonlyArray<Coord>

type SquareDefinition = DeepReadonly<{
  groupId: number
  coordinates: Coord
  field: Field | undefined
  size: Size | undefined
}>

type Board = DeepReadonly<SquareDefinition[][]>

type State = DeepReadonly<{
  board: Board
  emptySquares: Coord[]
  groups: Group[]
}>

const initState = (x: number, y: number): DeepReadonly<State> => {
  const board: Board = Array(y)
    .fill(0)
    .map((_, i) =>
      Array(x)
        .fill(0)
        .map(
          (_, j): Readonly<SquareDefinition> => ({
            groupId: -1,
            coordinates: new Coord(i, j),
            field: undefined,
            size: undefined,
          }),
        ),
    )
  const emptySquares: Coord[] = board.flatMap((row, i) =>
    row.map((_, j) => new Coord(j, i)),
  )
  return { board, emptySquares, groups: [] }
}

const getBoardWithUpdatedSquare = (
  board: Board,
  square: DeepReadonly<SquareDefinition>,
): DeepReadonly<SquareDefinition[][]> => {
  return [
    ...board.map((row) =>
      row.map((s) =>
        s.coordinates.x === square.coordinates.x &&
        s.coordinates.y === square.coordinates.y
          ? square
          : s,
      ),
    ),
  ]
}

const pickRandom = <T>(list: T[]): T | undefined =>
  list[Math.floor(Math.random() * list.length)]

const randomIntFromInterval = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min)

const filterOutNeighbors = (
  coordinates: Coord,
  list: Readonly<Coord[]>,
): Coord[] => {
  return list.filter(({ x, y }) => {
    return Math.abs(x - coordinates.x) > 1 || Math.abs(y - coordinates.y) > 1
  })
}

const addToGroup = (
  groupId: number,
  coordinates: Coord,
  groups: Readonly<Group[]>,
): Group[] => {
  if (groups.length <= groupId + 1) return groups.concat([[coordinates]])
  return [
    ...groups.map((group, i) => {
      if (i === groupId) {
        return [...group, coordinates]
      } else return group
    }),
  ]
}

const insertSquareSize = (
  size: Size,
  minGroups: number,
  maxGroups: number,
  state: DeepReadonly<State>,
): DeepReadonly<State> => {
  let candidate: DeepReadonly<State>
  let candidateGroups: number
  do {
    // start fresh
    candidate = state
    let groupsLeft = randomIntFromInterval(minGroups, maxGroups)
    let validCoordinates: Readonly<Coord[]> = state.emptySquares
    let groupId = 0
    do {
      const randomCoordinates: Readonly<Coord> | undefined = pickRandom(
        validCoordinates as Coord[],
      )
      if (randomCoordinates === undefined) break

      candidate = {
        board: getBoardWithUpdatedSquare(candidate.board, {
          groupId: groupId,
          coordinates: randomCoordinates,
          size: size,
          field: undefined,
        }),
        emptySquares: candidate.emptySquares.filter(
          ({ x, y }) => x !== randomCoordinates.x || y !== randomCoordinates.y,
        ),
        groups: addToGroup(groupId, randomCoordinates, candidate.groups),
      }
      validCoordinates = filterOutNeighbors(randomCoordinates, validCoordinates)
      groupId++
      groupsLeft--
    } while (groupsLeft > 0 && validCoordinates.length > 0)
    candidateGroups = state.emptySquares.length - candidate.emptySquares.length
  } while (candidateGroups < minGroups || candidateGroups > maxGroups)
  return candidate
}

const getOrthogonalNeighbors = (
  coordinates: Coord,
  maxX: number,
  maxY: number,
): Coord[] => {
  return [
    new Coord(coordinates.x - 1, coordinates.y),
    new Coord(coordinates.x + 1, coordinates.y),
    new Coord(coordinates.x, coordinates.y - 1),
    new Coord(coordinates.x, coordinates.y + 1),
  ].filter(({ y, x }) => x >= 0 && x < maxX && y >= 0 && y < maxY)
}

const getGroupBorderSet = (
  group: Group,
  maxX: number,
  maxY: number,
): Coord[] => {
  return [
    ...new Set<Coord>(
      group.flatMap(({ x, y }) => {
        return getOrthogonalNeighbors(new Coord(x, y), maxX, maxY)
      }),
    ),
  ]
}

function growGroups(state: DeepReadonly<State>): State {
  // - mantenere il confine esterno del gruppo
  // - crescere in una cella di confine esterno casuale
  // - aggiornare il confine esterno in una variabile temporanea
  // - controllare che tutte le celle del confine temporaneo abbiano un path di max 4 passi ad un Size.One
  // - se va bene, aggiornare il confine esterno e continuare
  // - se va male, tornare allo stato iniziale e togliere la cella tentata dal confine esterno, in modo da non provarla piu'

  let newState: DeepReadonly<State>
  let validConfig

  do {
    newState = state
    validConfig = false

    // for every group
    newState.groups.forEach((_, groupId) => {
      let border: Coord[]
      const blacklist = new CoordSet()

      do {
        border = getGroupBorderSet(
          newState.groups[groupId],
          newState.board[0].length,
          newState.board.length,
        ).filter((x) => !blacklist.has(x))

        const candidateBorderSquare: Coord | undefined = pickRandom(border)
        if (candidateBorderSquare === undefined) break

        if (
          newState.board[candidateBorderSquare.x][candidateBorderSquare.y]
            .groupId === -1
        ) {
          // the square is empty, update the state adding that square to the group
          newState = {
            board: getBoardWithUpdatedSquare(newState.board, {
              groupId: groupId,
              coordinates: candidateBorderSquare,
              size: undefined,
              field: undefined,
            }),
            emptySquares: newState.emptySquares,
            groups: addToGroup(groupId, candidateBorderSquare, newState.groups),
          }
        } else {
          // build a blacklist to avoid trying the same square again
          blacklist.add(candidateBorderSquare)
        }
      } while (newState.groups[groupId].length < 5 && border.length > 0)
    })

    // check if the configuration is valid
    if (
      newState.groups
        .map((group) => group.length)
        .reduce((sum, x) => sum + x, 0) ===
      newState.board.length * newState.board[0].length
    ) {
      validConfig = true
    }
  } while (!validConfig)

  return newState
}

export function generateState() {
  const initialState: DeepReadonly<State> = initState(10, 5)

  const state = insertSquareSize(Size.One, 12, 17, initialState)

  // creare i gruppi
  const stateWithGroups = growGroups(state)
  console.log(stateWithGroups)

  // distribuire i numeri oltre l'1

  // assegnare i colori ai gruppi

  return stateWithGroups.board
}
