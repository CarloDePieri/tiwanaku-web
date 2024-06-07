import { Coord } from "./Coord.ts"
import { Field } from "./enums.ts"
import { Group } from "./Group.ts"

describe("A group", () => {
  let group: Group

  beforeEach(() => {
    group = new Group([], Field.mountain)
  })

  it("should be able to add elements to it", () => {
    const newGroup = group.add(new Coord(1, 1))
    expect(newGroup.has(new Coord(1, 1))).toBe(true)
    expect(group.has(new Coord(1, 1))).toBe(false)
    expect(newGroup.field).toBe(Field.mountain)
  })

  it("should be able to change it's field type", () => {
    const newGroup = group.add(new Coord(1, 1)).copyWithField(Field.valley)
    expect(newGroup.field).toBe(Field.valley)
    expect(newGroup.has(new Coord(1, 1))).toBe(true)
    expect(group.field).toBe(Field.mountain)
  })

  it("should get it's neighboring coordinates", () => {
    const newGroup = group
      .add(new Coord(0, 0))
      .add(new Coord(1, 0))
      .add(new Coord(0, 1))
    const neighbors = newGroup.getOrthogonalNeighbors(3, 3)
    expect(neighbors).toContainEqual(new Coord(2, 0))
    expect(neighbors).toContainEqual(new Coord(1, 1))
    expect(neighbors).toContainEqual(new Coord(0, 2))
    expect(neighbors.size).toBe(3)
  })
})
