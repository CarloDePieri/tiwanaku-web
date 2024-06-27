import { Coord, SerializedCoord } from "./Coord"

describe("A coordinate", () => {
  let coord: Coord
  let serializedCoord: SerializedCoord

  beforeAll(() => {
    coord = new Coord(1, 1)
    serializedCoord = { x: 1, y: 1 }
  })

  it("should recognize an equal coordinate", () => {
    const coord2 = new Coord(1, 1)
    const coord3 = new Coord(1, 2)
    expect(coord.equals(coord2)).toBe(true)
    expect(coord.equals(coord3)).toBe(false)
  })

  it("should be able to serialize and deserialize", () => {
    expect(coord.serialize()).toEqual(serializedCoord)
    expect(Coord.deserialize(serializedCoord)).toEqual(coord)
  })

  describe("with orthogonal neighbors", () => {
    it("should return them", () => {
      const neighbors = [
        new Coord(0, 1),
        new Coord(1, 2),
        new Coord(2, 1),
        new Coord(1, 0),
      ]
      const computedNeighbors = coord.getOrthogonalNeighbors(5, 5)
      expect(computedNeighbors.length).toBe(neighbors.length)
      neighbors.forEach((neighbor) => {
        expect(computedNeighbors).toContainEqual(neighbor)
      })
    })

    it("should keep track of the board edge", () => {
      const neighbors = [new Coord(0, 1), new Coord(1, 0)]
      const computedNeighbors = coord.getOrthogonalNeighbors(2, 2)
      expect(computedNeighbors.length).toBe(neighbors.length)
      neighbors.forEach((neighbor) => {
        expect(computedNeighbors).toContainEqual(neighbor)
      })
    })
  })

  describe("with neighbors", () => {
    it("should return them", () => {
      const neighbors = [
        new Coord(0, 0),
        new Coord(0, 1),
        new Coord(0, 2),
        new Coord(2, 0),
        new Coord(2, 1),
        new Coord(2, 2),
        new Coord(1, 0),
        new Coord(1, 2),
      ]
      const computedNeighbors = coord.getNeighbors(5, 5)
      expect(computedNeighbors.length).toBe(neighbors.length)
      neighbors.forEach((neighbor) => {
        expect(computedNeighbors).toContainEqual(neighbor)
      })
    })

    it("should keep track of the board edge", () => {
      const neighbors = [new Coord(0, 0), new Coord(0, 1), new Coord(1, 0)]
      const computedNeighbors = coord.getNeighbors(2, 2)
      expect(computedNeighbors.length).toBe(neighbors.length)
      neighbors.forEach((neighbor) => {
        expect(computedNeighbors).toContainEqual(neighbor)
      })
    })
  })
})
