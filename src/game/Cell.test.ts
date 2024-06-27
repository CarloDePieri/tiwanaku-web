import { IncompleteCell } from "./Cell"
import { Coord } from "./Coord"
import { Crop, Field } from "./enums"

describe("An incomplete Cell", () => {
  let cell: IncompleteCell
  let coord: Coord

  beforeEach(() => {
    coord = new Coord(1, 1)
    cell = new IncompleteCell(undefined, coord, undefined, undefined)
  })

  it("should allow to copy an object, updating some fields", () => {
    const newCoord = new Coord(2, 2)
    const newField = Field.desert
    const newCrop = Crop.four

    const newCell = cell.copyWith({
      coordinates: newCoord,
      field: newField,
      crop: newCrop,
    })

    expect(newCell.groupId).toBeUndefined()
    expect(newCell.coordinates).toEqual(newCoord)
    expect(newCell.field).toBe(newField)
    expect(newCell.crop).toBe(newCrop)

    // Also check that nullable fields can be nulled
    const nulledFieldCell = newCell.copyWith({
      field: undefined,
      crop: undefined,
      groupId: undefined,
      coordinates: undefined,
    })
    // these should be nulled
    expect(nulledFieldCell.field).toBeUndefined()
    expect(nulledFieldCell.crop).toBeUndefined()
    expect(nulledFieldCell.groupId).toBeUndefined()
    // these should not have changed!
    expect(newCell.coordinates).toEqual(newCoord)
  })
})
