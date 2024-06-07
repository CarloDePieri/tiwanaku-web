import { Cell } from "./Cell"
import { Coord } from "./Coord"
import { Crop, Field } from "./enums"

describe("A Cell", () => {
  let cell: Cell
  let coord: Coord

  beforeEach(() => {
    coord = new Coord(1, 1)
    cell = new Cell(undefined, coord, undefined, undefined, false, false)
  })

  // noinspection JSConstantReassignment
  it("should have readonly properties", () => {
    // Attempt to change the properties
    // @ts-expect-error - it's a test
    cell.groupId = 1
    // @ts-expect-error - it's a test
    cell.coordinates = new Coord(2, 2)
    // @ts-expect-error - it's a test
    cell.field = Field.Corn
    // @ts-expect-error - it's a test
    cell.crop = Crop.Wheat
    // @ts-expect-error - it's a test
    cell.hiddenField = true
    // @ts-expect-error - it's a test
    cell.hiddenCrop = true

    // Check if the properties remain the same
    expect(cell.groupId).toBeUndefined()
    expect(cell.coordinates).toEqual(coord)
    expect(cell.field).toBeUndefined()
    expect(cell.crop).toBeUndefined()
    expect(cell.hiddenField).toBe(false)
    expect(cell.hiddenCrop).toBe(false)
  })

  it("should allow to copy an object, updating some fields", () => {
    const newCoord = new Coord(2, 2)
    const newField = Field.desert
    const newCrop = Crop.four
    const newHiddenField = true
    const newHiddenCrop = true

    const newCell = cell.copyWith({
      coordinates: newCoord,
      field: newField,
      crop: newCrop,
      hiddenField: newHiddenField,
      hiddenCrop: newHiddenCrop,
    })

    expect(newCell.groupId).toBeUndefined()
    expect(newCell.coordinates).toEqual(newCoord)
    expect(newCell.field).toBe(newField)
    expect(newCell.crop).toBe(newCrop)
    expect(newCell.hiddenField).toBe(newHiddenField)
    expect(newCell.hiddenCrop).toBe(newHiddenCrop)

    // Also check that nullable fields can be nulled
    const nulledFieldCell = newCell.copyWith({
      field: undefined,
      crop: undefined,
      groupId: undefined,
      hiddenField: undefined,
      hiddenCrop: undefined,
      coordinates: undefined,
    })
    // these should be nulled
    expect(nulledFieldCell.field).toBeUndefined()
    expect(nulledFieldCell.crop).toBeUndefined()
    expect(nulledFieldCell.groupId).toBeUndefined()
    // these should not have changed!
    expect(newCell.coordinates).toEqual(newCoord)
    expect(newCell.hiddenField).toBe(newHiddenField)
    expect(newCell.hiddenCrop).toBe(newHiddenCrop)
  })
})
