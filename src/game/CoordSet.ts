import { Coord } from "./Coord.ts"

/**
 * A set of coordinates. It uses the `Coord.equals` method to check for equality.
 */
export class CoordSet extends Set<Coord> {
  /**
   * Check if this set has a coordinate.
   *
   * @param {Coord} coord - The coordinate to check for.
   * @return {boolean} True if the set has the coordinate, false otherwise.
   */
  public has(coord: Coord): boolean {
    return this._find(coord) !== null
  }

  /**
   * Add a coordinate to the set, if it's not already in the set.
   *
   * @param {Coord} coord - The coordinate to add.
   * @return {this} The set itself.
   */
  public add(coord: Coord): this {
    if (!this.has(coord)) {
      super.add(coord)
    }
    return this
  }

  /**
   * Delete a coordinate from the set.
   *
   * @param {Coord} coord - The coordinate to delete.
   * @return {boolean} True if the coordinate was deleted, false otherwise.
   */
  public delete(coord: Coord): boolean {
    const found = this._find(coord)
    if (found) {
      return super.delete(found)
    }
    return false
  }

  // Find a specific coordinate in the set, using the .equals() for equality
  private _find(coord: Coord): Coord | null {
    for (const c of this) {
      if (c.equals(coord)) {
        return c
      }
    }
    return null
  }
}
