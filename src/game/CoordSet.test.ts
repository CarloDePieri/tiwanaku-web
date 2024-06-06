import { CoordSet } from "./CoordSet"
import { Coord } from "./Coord"

describe("A set of Coord", () => {
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
    set.add(new Coord(1, 2))
    expect(set.has(new Coord(1, 2))).toBe(true)
  })

  it("should not add a new element twice", () => {
    // NOTE it's important that these Coord are not the same instance
    set.add(new Coord(1, 2))
    set.add(new Coord(1, 2))
    expect(set.has(new Coord(1, 2))).toBe(true)
    expect(set.size).toBe(3)
  })

  it("should be able to delete an element", () => {
    set.delete(new Coord(1, 1))
    expect(set.size).toBe(1)
  })
})
