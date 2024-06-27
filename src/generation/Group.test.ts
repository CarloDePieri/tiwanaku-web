import { Coord } from "./Coord.ts"
import { Field } from "../game/enums.ts"
import { Group } from "./Group.ts"

describe("A group", () => {
  let group: Group

  beforeEach(() => {
    group = Group.from([], Field.mountain)
  })

  it("should not lose fields when using methods from the super", () => {
    const coord = new Coord(0, 0)
    const newGroup = group.withCoord(coord)
    expect(newGroup.field).toBe(Field.mountain)
  })

  it("should be able to add elements to it", () => {
    const newGroup = group
      .withCoord(new Coord(1, 1))
      .withCoord(new Coord(1, 2))
      .withoutCoord(new Coord(1, 2))
    expect(newGroup.has(new Coord(1, 1))).toBe(true)
    expect(group.has(new Coord(1, 1))).toBe(false)
    expect(newGroup.has(new Coord(1, 2))).toBe(false)
    expect(newGroup.field).toBe(Field.mountain)
  })

  it("should be able to change it's field type", () => {
    const newGroup = group
      .withCoord(new Coord(1, 1))
      .copyWith({ field: Field.valley, groupId: 1 })
    expect(newGroup.field).toBe(Field.valley)
    expect(newGroup.has(new Coord(1, 1))).toBe(true)
    expect(newGroup.groupId).toBe(1)
    expect(group.field).toBe(Field.mountain)
    expect(group.groupId).toBeUndefined()
  })

  it("should get it's neighboring coordinates", () => {
    const newGroup = group
      .withCoord(new Coord(0, 0))
      .withCoord(new Coord(1, 0))
      .withCoord(new Coord(0, 1))
    const neighbors = newGroup.getOrthogonalNeighbors(3, 3)
    expect(neighbors).toContainEqual(new Coord(2, 0))
    expect(neighbors).toContainEqual(new Coord(1, 1))
    expect(neighbors).toContainEqual(new Coord(0, 2))
    expect(neighbors.size).toBe(3)
  })

  it("should maintain properties of CoordSet", () => {
    const newGroup = Group.from(
      [new Coord(1, 1), new Coord(1, 1)],
      Field.mountain,
    )
    expect(newGroup.size).toBe(1)
  })
})
