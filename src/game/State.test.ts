import { State, SerializedBoard } from "./State.ts"
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

describe("A board State class", () => {
  it("should have a factory method to create an empty board", () => {
    const state = State.Empty(3, 4)
    expect(state.boardHeight).toBe(4)
    expect(state.boardWidth).toBe(3)
  })

  it("should be able to build a board from an initial matrix", () => {
    const state = State.fromBoard(testInitialBoard)
    expect(state.board).toEqual(testInitialBoard)
  })

  it("should be independent of the initial matrix", () => {
    const copyBoard = { ...testInitialBoard }
    const state = State.fromBoard(testInitialBoard)
    copyBoard[0][0] = copyBoard[0][0].copyWith({ field: Field.valley })
    expect(state.getCell(0, 0)).not.toEqual(copyBoard[0][0])
  })
})

describe("A board State", () => {
  const state = State.fromBoard(testInitialBoard)

  it("should be able to get a specific cell", () => {
    const cell = state.getCell(1, 1)
    expect(cell).toEqual(testInitialBoard[1][1])
  })

  it("should be able to get all its coordinate in a set", () => {
    const coords = state.getBoardCoordinates()
    expect(coords.size).toBe(4)
  })

  it("should be able to serialize and deserialize", () => {
    expect(State.fromSerializedBoard(testInitialBoardSerialized)).toEqual(state)
    expect(state.getSerializedBoard()).toEqual(testInitialBoardSerialized)
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
    const newBoard = state.copyWithCell(newCell)
    expect(newBoard.getCell(0, 0)).toEqual(newCell)
  })

  it("should have an hash function", () => {
    const a = State.fromBoard(testInitialBoard)
    const b = State.fromBoard(testInitialBoard)
    expect(a.hash).toEqual(b.hash)
  })

  it("should maintain a Group structure", () => {
    const groups = state.groups
    expect(Array.from(groups.values()).length).toBe(2)
    const groupOne = groups.get(1)
    expect(groupOne).toBeDefined()
    expect(groupOne?.field).toBe(Field.desert)
    expect(groupOne?.groupId).toBe(1)
    expect(groups.get(0)).not.toBeDefined()
    const groupTwo = groups.get(2)
    expect(groupTwo).toBeDefined()
    expect(groupTwo?.field).toBe(Field.mountain)
    expect(groupTwo?.groupId).toBe(2)
  })

  it("should update the group structure when updating cells", () => {
    const newBoard = state.copyWithCell(
      new Cell(3, new Coord(0, 0), Field.valley, undefined, true, true),
    )
    const groups = newBoard.groups
    expect(Array.from(groups.values()).length).toBe(3)
    const groupThree = groups.get(3)
    expect(groupThree).toBeDefined()
    expect(groupThree?.field).toBe(Field.valley)
    expect(groupThree?.groupId).toBe(3)
  })
})
