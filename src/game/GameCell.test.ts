import { IncompleteCell } from "../generation/IncompleteCell.ts"
import { Coord } from "../generation/Coord.ts"
import { Crop, Field } from "./enums.ts"
import { GameCell, SerializedCell } from "./GameCell.ts"

describe("A complete Cell", () => {
  let cell: GameCell
  let coord: Coord
  let serializedCell: SerializedCell

  beforeEach(() => {
    coord = new Coord(1, 1)
    cell = GameCell.fromCompleteCell(
      new IncompleteCell(1, coord, Field.desert, Crop.four),
    )
    serializedCell = {
      field: "desert",
      crop: 4,
      groupId: 1,
      coordinates: { x: 1, y: 1 },
      hiddenField: true,
      hiddenCrop: true,
    }
  })

  it("should be able to serialize and deserialize", () => {
    expect(cell.serialize()).toEqual(serializedCell)
    expect(GameCell.deserialize(serializedCell)).toEqual(cell)
  })

  it("should be able to create a copy with discovered field and crop", () => {
    expect(cell.isFieldHidden).toBe(true)
    expect(cell.isCropHidden).toBe(true)
    const discoveredFieldCell = cell.copyAndDiscoverField()
    expect(discoveredFieldCell.isFieldHidden).toBe(false)
    expect(discoveredFieldCell.isCropHidden).toBe(true)
    const fullyDiscoveredCell = discoveredFieldCell.copyAndDiscoverCrop()
    expect(fullyDiscoveredCell.isFieldHidden).toBe(false)
    expect(fullyDiscoveredCell.isCropHidden).toBe(false)
    expect(fullyDiscoveredCell.coordinates).toEqual(cell.coordinates)
    expect(fullyDiscoveredCell.groupId).toBe(cell.groupId)
    expect(fullyDiscoveredCell.field).toBe(cell.field)
    expect(fullyDiscoveredCell.crop).toBe(cell.crop)
  })

  it("should be able to create an already discovered cell", () => {
    const discoveredCell = GameCell.fromCompleteCell(
      new IncompleteCell(1, coord, Field.desert, Crop.four),
      false,
      false,
    )
    expect(discoveredCell.isFieldHidden).toBe(false)
    expect(discoveredCell.isCropHidden).toBe(false)
  })
})
