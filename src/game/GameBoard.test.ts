import { IncompleteCell } from "./Cell.ts"
import { Coord } from "./Coord.ts"
import { Crop, Field } from "./enums.ts"
import { GameBoard, SerializedBoard } from "./GameBoard.ts"
import { State } from "./State.ts"

const testState = GameBoard.fromCompleteState(
  State.fromBoard([
    [
      new IncompleteCell(1, new Coord(0, 0), Field.desert, Crop.two),
      new IncompleteCell(1, new Coord(0, 1), Field.desert, Crop.one),
    ],
    [
      new IncompleteCell(2, new Coord(1, 0), Field.mountain, Crop.one),
      new IncompleteCell(2, new Coord(1, 1), Field.mountain, Crop.two),
    ],
  ]),
)
const testInitialBoardSerialized: SerializedBoard = [
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
      hiddenField: true,
      hiddenCrop: true,
    },
  ],
]

describe("A GameBoard class", () => {
  it("should be able to serialize and deserialize", () => {
    expect(GameBoard.fromSerializedBoard(testInitialBoardSerialized)).toEqual(
      testState,
    )
    expect(testState.getSerializedBoard()).toEqual(testInitialBoardSerialized)
  })
})
