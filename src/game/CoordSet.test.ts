import { CoordSet } from "./CoordSet.ts"
import { Coord } from "./Coord"

describe("An immutable set of Coord", () => {
  let set: CoordSet

  beforeEach(() => {
    set = new CoordSet([new Coord(1, 1), new Coord(2, 2)])
  })

  it("should have a working has", () => {
    // NOTE it's important that these Coord are not the same instance
    expect(set.has(new Coord(1, 1))).toBe(true)
    expect(set.has(new Coord(1, 2))).toBe(false)
  })

  it("should have a constructor that use equals", () => {
    const newSet = new CoordSet([new Coord(1, 1), new Coord(1, 1)])
    expect(newSet.size).toBe(1)
  })

  it("should be able to add elements", () => {
    const newSet = set.withCoord(new Coord(1, 2))
    expect(newSet.has(new Coord(1, 2))).toBe(true)
    expect(set.has(new Coord(1, 2))).toBe(false)
  })

  it("should not add a new element twice", () => {
    // NOTE it's important that these Coord are not the same instance
    const newSet = set.withCoord(new Coord(1, 2)).withCoord(new Coord(1, 2))
    expect(newSet.has(new Coord(1, 2))).toBe(true)
    expect(newSet.size).toBe(3)
  })

  it("should be able to delete an element", () => {
    const newSet = set.withoutCoord(new Coord(1, 1))
    expect(newSet.size).toBe(1)
    expect(set.size).toBe(2)
  })

  it("can be iterated", () => {
    for (const coord of set) {
      expect(coord).toBeInstanceOf(Coord)
    }
  })

  it("can be converted to an array", () => {
    const array = set.toArray()
    expect(array.length).toBe(2)
    expect(array[0]).toBeInstanceOf(Coord)
  })

  it("should have a working flatmap operation", () => {
    const newSet = set.flatMap(
      (coord) => new CoordSet([coord, new Coord(coord.x * 3, coord.y * 3)]),
    )
    expect(newSet.has(new Coord(1, 1))).toBe(true)
    expect(newSet.has(new Coord(3, 3))).toBe(true)
    expect(newSet.has(new Coord(2, 2))).toBe(true)
    expect(newSet.has(new Coord(6, 6))).toBe(true)
    expect(newSet.size).toBe(4)
  })

  it("should have the filter operation", () => {
    const newSet = set.filter((coord) => coord.x === 1)
    expect(newSet.has(new Coord(1, 1))).toBe(true)
    expect(newSet.has(new Coord(2, 2))).toBe(false)
    expect(newSet.size).toBe(1)
  })

  it("should have the difference operation", () => {
    const newSet = set.difference(new CoordSet([new Coord(1, 1)]))
    expect(newSet.has(new Coord(1, 1))).toBe(false)
    expect(newSet.has(new Coord(2, 2))).toBe(true)
    expect(newSet.size).toBe(1)
  })

  it("should have a factory method that copies the initial iterator", () => {
    const initial = [new Coord(1, 1), new Coord(2, 2)]
    const newSet = new CoordSet(initial)
    initial[0] = new Coord(3, 3)
    expect(newSet.has(new Coord(1, 1))).toBe(true)
    expect(newSet.has(new Coord(3, 3))).toBe(false)
  })
})
