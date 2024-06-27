import { State } from "./State.ts"
import { IncompleteCell } from "./Cell.ts"
import { Coord } from "./Coord.ts"
import { Field } from "../game/enums.ts"

const testInitialBoard = [
  [
    new IncompleteCell(undefined, new Coord(0, 0), undefined, undefined),
    new IncompleteCell(1, new Coord(0, 1), Field.desert, undefined),
  ],
  [
    new IncompleteCell(undefined, new Coord(1, 0), undefined, undefined),
    new IncompleteCell(2, new Coord(1, 1), Field.mountain, undefined),
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

  it("should be able to return a copy with an updated cell", () => {
    const newCell = new IncompleteCell(
      undefined,
      new Coord(0, 0),
      Field.valley,
      undefined,
    )
    const newBoard = state.copyWithCell(newCell)
    expect(newBoard.getCell(0, 0)).toEqual(newCell)
  })

  it("should have an hash function", () => {
    const a = State.fromBoard(testInitialBoard)
    const b = State.fromBoard(testInitialBoard)
    const c = state.copyWithCell(
      new IncompleteCell(3, new Coord(0, 0), Field.valley, undefined),
    )
    expect(a.hash).toEqual(b.hash)
    expect(a.hash).not.toEqual(c.hash)
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
      new IncompleteCell(3, new Coord(0, 0), Field.valley, undefined),
    )
    const groups = newBoard.groups
    expect(Array.from(groups.values()).length).toBe(3)
    const groupThree = groups.get(3)
    expect(groupThree).toBeDefined()
    expect(groupThree?.field).toBe(Field.valley)
    expect(groupThree?.groupId).toBe(3)
  })
})
