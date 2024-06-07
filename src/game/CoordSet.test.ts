import { CoordSet } from "./CoordSet"
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

  it("should be able to add elements", () => {
    const newSet = set.add(new Coord(1, 2))
    expect(newSet.has(new Coord(1, 2))).toBe(true)
    expect(set.has(new Coord(1, 2))).toBe(false)
  })

  it("should not add a new element twice", () => {
    // NOTE it's important that these Coord are not the same instance
    const newSet = set.add(new Coord(1, 2)).add(new Coord(1, 2))
    expect(newSet.has(new Coord(1, 2))).toBe(true)
    expect(newSet.size).toBe(3)
  })

  it("should be able to delete an element", () => {
    const newSet = set.delete(new Coord(1, 1))
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
})
