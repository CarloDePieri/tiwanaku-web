import { Board, SerializedBoard } from "./Board.ts"
import { Cell } from "./Cell.ts"
import { Coord } from "./Coord.ts"
import { Field } from "./enums.ts"

const testInitialBoard = [
  [
    new Cell(undefined, new Coord(0, 0), undefined, undefined, true, true),
    new Cell(1, new Coord(0, 1), Field.desert, undefined, true, true),
  ],
  [
    new Cell(undefined, new Coord(1, 0), undefined, undefined, true, true),
    new Cell(2, new Coord(1, 1), Field.mountain, undefined, true, true),
  ],
]

const testInitialBoardSerialized: SerializedBoard = [
  [
    {
      field: undefined,
      coordinates: { x: 0, y: 0 },
      groupId: undefined,
      crop: undefined,
      hiddenField: true,
      hiddenCrop: true,
    },
    {
      field: "desert",
      coordinates: { x: 0, y: 1 },
      groupId: 1,
      crop: undefined,
      hiddenField: true,
      hiddenCrop: true,
    },
  ],
  [
    {
      field: undefined,
      coordinates: { x: 1, y: 0 },
      groupId: undefined,
      crop: undefined,
      hiddenField: true,
      hiddenCrop: true,
    },
    {
      field: "mountain",
      coordinates: { x: 1, y: 1 },
      groupId: 2,
      crop: undefined,
      hiddenField: true,
      hiddenCrop: true,
    },
  ],
]

describe("A board class", () => {
  it("should have a factory method to create an empty board", () => {
    const board = Board.Empty(3, 4)
    expect(board.height).toBe(4)
    expect(board.width).toBe(3)
  })

  it("should be able to build a Board from an initial matrix", () => {
    const board = Board.fromCells(testInitialBoard)
    expect(board.board).toEqual(testInitialBoard)
  })

  it("should be independent of the initial matrix", () => {
    const copyBoard = { ...testInitialBoard }
    const board = Board.fromCells(testInitialBoard)
    copyBoard[0][0] = copyBoard[0][0].copyWith({ field: Field.valley })
    expect(board.getCell(0, 0)).not.toEqual(copyBoard[0][0])
  })
})

describe("A board", () => {
  const board = Board.fromCells(testInitialBoard)

  it("should be able to get a specific cell", () => {
    const cell = board.getCell(1, 1)
    expect(cell).toEqual(testInitialBoard[1][1])
  })

  it("should be able to get all its coordinate in a set", () => {
    const coords = board.getAllCoordinates()
    expect(coords.size).toBe(4)
  })

  it("should be able to serialize and deserialize", () => {
    expect(Board.deserialize(testInitialBoardSerialized)).toEqual(board)
    expect(board.serialize()).toEqual(testInitialBoardSerialized)
  })

  it("should be able to return a copy with an updated cell", () => {
    const newCell = new Cell(
      undefined,
      new Coord(0, 0),
      Field.valley,
      undefined,
      true,
      true,
    )
    const newBoard = board.copyWithCell(newCell)
    expect(newBoard.getCell(0, 0)).toEqual(newCell)
  })

  it("should have an hash function", () => {
    const a = Board.fromCells(testInitialBoard)
    const b = Board.fromCells(testInitialBoard)
    expect(a.hash).toEqual(b.hash)
  })
})
