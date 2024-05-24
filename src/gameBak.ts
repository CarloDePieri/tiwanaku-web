import { DeepReadonly } from "ts-essentials";

type Coordinates = [number, number]

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
  Five = 5
}

export interface SquareDefinition {
  coordinates: Coordinates;
  field: Field | undefined;
  size: Size | undefined;
}

const possibleFields = [Field.Forest, Field.Desert, Field.Mountain, Field.Valley];
const possibleSizes = [Size.One, Size.Two, Size.Three, Size.Four, Size.Five];

type State = {
  readonly board: SquareDefinition[][];
  readonly emptySquares: Coordinates[];
}

function initState(): DeepReadonly<State> {
  const board: SquareDefinition[][] = [];
  const emptySquares: Coordinates[] = [];

  for (let i = 0; i < 5; i++) {
    const row: SquareDefinition[] = [];
    for (let j = 0; j < 5; j++) {
      emptySquares.push([i, j])
      row.push({
        coordinates: [i, j],
        field: undefined,
        size: undefined,
      });
    }
    board.push(row);
  }

  return {
    board,
    emptySquares,
  } as const
}

const filterOutNeighbors =
  (coordinates: Coordinates, list: Coordinates[]): Coordinates[] => {
    return list.filter(([x, y]) => {
      return Math.abs(x - coordinates[0]) > 1 || Math.abs(y - coordinates[1]) > 1;
    });
  }

const pickRandom = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


function insertSize(size: Size, minGroups: number, maxGroups: number, state: DeepReadonly<State>): DeepReadonly<State> {

  let validCoordinates: Coordinates[] = Object.assign([], state.emptySquares)

  let counter = 0;
  while (validCoordinates.length > 0 && counter < maxGroups) {
    const randomCoordinates = pickRandom(validCoordinates);
    state.board[randomCoordinates[0]][randomCoordinates[1]] = {
      ...state.board[randomCoordinates[0]][randomCoordinates[1]],
      size: size,
    }
    state.emptySquares = state.emptySquares.filter(([x, y]) => x !== randomCoordinates[0] || y !== randomCoordinates[1]);
    validCoordinates = filterOutNeighbors(randomCoordinates, validCoordinates)
    counter++
  }

  return state;
}


export function generateState(): SquareDefinition[][] {
  const state = initState();

  // insert 1

  const maxGroups = randomIntFromInterval(6, 9)

  insertSize(Size.One, 6, maxGroups, state)


  return state.board
}