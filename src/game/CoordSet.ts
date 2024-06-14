import { Coord } from "./Coord.ts"
import { shuffledCopy } from "./utils.ts"

/**
 * An immutable set of equatable coordinates.
 */
export class CoordSet implements ReadonlySet<Coord> {
  private readonly _set: Set<Coord>

  constructor(initialValues?: Iterable<Coord>) {
    const filteredValues: Coord[] = []
    if (initialValues) {
      for (const value of initialValues) {
        if (!filteredValues.some((v) => v.equals(value))) {
          filteredValues.push(value)
        }
      }
    }
    this._set = new Set(filteredValues)
  }

  /**
   * Get the size of the set.
   *
   * @return {number} The size of the set.
   */
  public get size(): number {
    return this._set.size
  }

  /**
   * Check if this set contains a coordinate.
   *
   * @param {Coord} coord - The coordinate to check for.
   * @return {boolean} True if the set contains the coordinate, false otherwise.
   */
  public has(coord: Coord): boolean {
    return this._find(coord) !== null
  }

  /**
   * Add a coordinate to a copy of the set, if it's not already in the set.
   *
   * @param {Coord} coord - The coordinate to add.
   * @return {this} The copy of the set with the new coordinate.
   */
  public withCoord(coord: Coord): CoordSet {
    if (!this.has(coord)) {
      return new CoordSet([...this._set, coord])
    }
    return this
  }

  /**
   * Return a copy of the set without the coordinate.
   *
   * @param {Coord} coord - The coordinate to delete.
   * @return {this} The copy of the set without the coordinate.
   */
  public withoutCoord(coord: Coord): CoordSet {
    const found = this._find(coord)
    if (found) {
      const newCopy = new CoordSet(this._set)
      newCopy._set.delete(found)
      return newCopy
    }
    return this
  }

  /**
   * Calls a defined callback function on each element of the set.
   *
   * @param callbackfn - A function that will be called on each element.
   * @param {Coord} callbackfn.coord1 - The coordinate.
   * @param {Coord} callbackfn.coord2 - The coordinate.
   * @param {EquatableReadonlySet<Coord>} callbackfn.set - The set that forEach was called upon.
   * @param thisArg - An object to which the 'this' keyword can refer in the callbackfn function.
   */
  forEach(
    callbackfn: (coord1: Coord, coord2: Coord, set: CoordSet) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any,
  ): void {
    for (const coord of this._set) {
      callbackfn.call(thisArg, coord, coord, this)
    }
  }

  /**
   * Creates a new set with all coordinates that pass the test implemented by the provided function.
   *
   * @param {(coord: Coord) => boolean} fn - A predicate function to test each element of the set.
   * Return `true` to keep the element, `false` otherwise. It accepts an argument:
   * `coord`: The current element being processed in the set.
   * @return {CoordSet} A new set with the coordinates that pass the test.
   * If no coordinates pass the test, an empty set will be returned.
   */
  public filter(fn: (coord: Coord) => boolean): CoordSet {
    return new CoordSet(this.toArray().filter(fn))
  }

  /**
   * Applies a function to each coordinate in the set that returns a CoordSet for each coordinate, and then flattens the result into a new set.
   *
   * @param {function} fn - The function to execute on each coordinate, which returns a CoordSet.
   * @return {CoordSet} A new flattened set.
   */
  public flatMap(fn: (value: Coord) => CoordSet): CoordSet {
    const newValues = this.toArray()
      .map(fn)
      .reduce((acc, set) => acc.concat(set.toArray()), new Array<Coord>())
    return new CoordSet(newValues)
  }

  /**
   * Creates a new set with all coordinates that are in this set but not in the other set.
   *
   * @param {CoordSet} other - The set to compare with.
   * @return {CoordSet} A new set with the coordinates that are in this set but not in the other set.
   * If no coordinate are different, an empty set will be returned.
   */
  public difference(other: CoordSet): CoordSet {
    return this.filter((coord) => !other.has(coord))
  }

  /**
   * Creates a copy of the set.
   *
   * @return {CoordSet} A new set that is a copy of the current set.
   */
  public copy(): CoordSet {
    return new CoordSet(this._set)
  }

  /**
   * Get a shuffled copy of the set.
   *
   * @return {CoordSet} A new set that is a shuffled copy of the current set.
   */
  public copyShuffled(): CoordSet {
    return new CoordSet(shuffledCopy(this.toArray()))
  }

  // Find a specific value in the set, using the .equals() for equality
  private _find(value: Coord): Coord | null {
    for (const v of this) {
      if (v.equals(value)) {
        return v
      }
    }
    return null
  }

  // Method to convert to array
  toArray(): Coord[] {
    return Array.from(this._set)
  }

  // Method to iterate over the set
  [Symbol.iterator](): IterableIterator<Coord> {
    return this._set[Symbol.iterator]()
  }
  entries(): IterableIterator<[Coord, Coord]> {
    return this._set.entries()
  }
  keys(): IterableIterator<Coord> {
    return this._set.keys()
  }
  values(): IterableIterator<Coord> {
    return this._set.values()
  }
}
