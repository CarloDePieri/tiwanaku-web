import { CoordSet } from "../generation/CoordSet.ts"
import { IncompleteCell } from "../generation/IncompleteCell.ts"
import { Coord } from "../generation/Coord.ts"
import { Crop, Field } from "./enums.ts"
import { GameBoard, SerializedBoard } from "./GameBoard.ts"
import { State } from "../generation/State.ts"

const testBoard = GameBoard.fromCompleteState(
  State.fromCellMatrix([
    [
      new IncompleteCell(1, new Coord(0, 0), Field.desert, Crop.two),
      new IncompleteCell(1, new Coord(0, 1), Field.desert, Crop.one),
    ],
    [
      new IncompleteCell(2, new Coord(1, 0), Field.mountain, Crop.one),
      new IncompleteCell(2, new Coord(1, 1), Field.mountain, Crop.two),
    ],
  ]),
  CoordSet.from([new Coord(1, 1)]),
)
const testInitialBoardSerialized: SerializedBoard = {
  board: [
    [
      {
        field: "desert",
        coordinates: { x: 0, y: 0 },
        groupId: 1,
        crop: 2,
        hiddenField: true,
        hiddenCrop: true,
      },
      {
        field: "desert",
        coordinates: { x: 0, y: 1 },
        groupId: 1,
        crop: 1,
        hiddenField: true,
        hiddenCrop: true,
      },
    ],
    [
      {
        field: "mountain",
        coordinates: { x: 1, y: 0 },
        groupId: 2,
        crop: 1,
        hiddenField: true,
        hiddenCrop: true,
      },
      {
        field: "mountain",
        coordinates: { x: 1, y: 1 },
        groupId: 2,
        crop: 2,
        hiddenField: false,
        hiddenCrop: false,
      },
    ],
  ],
  hiddenFields: {
    desert: 2,
    forest: 0,
    mountain: 2,
    valley: 0,
  },
}

describe("A GameBoard class", () => {
  it("should be able to serialize and deserialize", () => {
    expect(GameBoard.fromSerializedBoard(testInitialBoardSerialized)).toEqual(
      testBoard,
    )
    expect(testBoard.getSerializedBoard()).toEqual(testInitialBoardSerialized)
  })

  it("should keep track of undiscovered fields", () => {
    const hiddenFields = testBoard.undiscoveredFields
    expect(hiddenFields.mountain).toBe(2)
    expect(hiddenFields.valley).toBe(0)
    expect(hiddenFields.forest).toBe(0)
    expect(hiddenFields.desert).toBe(2)
    const nextBoard = testBoard.copyWithCell(
      testBoard.getCell(0, 0).copyAndDiscoverField(),
    )
    expect(nextBoard.undiscoveredFields.desert).toBe(1)
  })
})
