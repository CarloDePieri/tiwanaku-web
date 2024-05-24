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

type Coordinates = Readonly<[number, number]>

type SquareDefinition = DeepReadonly<{
  groupId: number
  coordinates: Coordinates
  field: Field | undefined
  size: Size | undefined
}>

type Board = DeepReadonly<SquareDefinition[][]>

type State = DeepReadonly<{
  board: Board
  emptySquares: Coordinates[]
}>

const initState = (n: number): DeepReadonly<State> => {
  const board: Board = Array(n)
    .fill(0)
    .map((_, i) =>
      Array(n)
        .fill(0)
        .map(
          (_, j): Readonly<SquareDefinition> => ({
            groupId: 0,
            coordinates: [i, j],
            field: undefined,
            size: undefined,
          }),
        ),
    )
  const emptySquares: Coordinates[] = board.flatMap((row, i) =>
    row.map((_, j) => [i, j] as Coordinates),
  )
  return { board, emptySquares }
}

const getUpdatedBoard = (
  board: Board,
  square: DeepReadonly<SquareDefinition>,
): DeepReadonly<SquareDefinition[][]> => {
  return [
    ...board.map((row) =>
      row.map((s) =>
        s.coordinates[0] === square.coordinates[0] &&
        s.coordinates[1] === square.coordinates[1]
          ? square
          : s,
      ),
    ),
  ]
}

const pickRandom = <T>(list: T[]): T =>
  list[Math.floor(Math.random() * list.length)]

const randomIntFromInterval = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min)

const filterOutNeighbors = (
  coordinates: Coordinates,
  list: Readonly<Coordinates[]>,
): Coordinates[] => {
  return list.filter(([x, y]) => {
    return Math.abs(x - coordinates[0]) > 1 || Math.abs(y - coordinates[1]) > 1
  })
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
    let validCoordinates: Readonly<Coordinates[]> = state.emptySquares
    let groupId = 1
    do {
      const randomCoordinates: Readonly<Coordinates> = pickRandom(
        validCoordinates as Coordinates[],
      )
      candidate = {
        board: getUpdatedBoard(candidate.board, {
          groupId: groupId,
          coordinates: randomCoordinates,
          size: size,
          field: undefined,
        }),
        emptySquares: candidate.emptySquares.filter(
          ([x, y]) => x !== randomCoordinates[0] || y !== randomCoordinates[1],
        ),
      }
      validCoordinates = filterOutNeighbors(randomCoordinates, validCoordinates)
      groupId++
      groupsLeft--
    } while (groupsLeft > 0 && validCoordinates.length > 0)
    candidateGroups = state.emptySquares.length - candidate.emptySquares.length
  } while (candidateGroups < minGroups || candidateGroups > maxGroups)
  return candidate
}

export function generateState() {
  const initialState: DeepReadonly<State> = initState(5)

  const state = insertSquareSize(Size.One, 6, 8, initialState)

  // creare i gruppi

  // distribuire i numeri oltre l'1

  // assegnare i colori ai gruppi

  return state.board
}
