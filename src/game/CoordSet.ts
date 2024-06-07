import { Coord } from "./Coord.ts"

interface Equatable<T> {
  equals(other: T): boolean
}

// noinspection JSValidateJSDoc
/**
 * An immutable set of equatable elements.
 * It uses the `Equatable.equals` method to check for equality.
 */
class ImmutableEquatableSet<T extends Equatable<T>> {
  private readonly _set: Set<T>

  constructor(initialValues?: Iterable<T>) {
    this._set = new Set(initialValues)
  }

  /**
   * Check if this set has a value.
   *
   * @param {T} value - The value to check for.
   * @return {boolean} True if the set has the value, false otherwise.
   */
  public has(value: T): boolean {
    return this._find(value) !== null
  }

  /**
   * Add a value to a copy of the set, if it's not already in the set.
   *
   * @param {T} value - The value to add.
   * @return {this} The copy of the set with the new value.
   */
  public add(value: T): ImmutableEquatableSet<T> {
    if (!this.has(value)) {
      return new ImmutableEquatableSet([...this._set, value])
    }
    return this
  }

  /**
   * Return a copy of the set without the value.
   *
   * @param {T} value - The value to delete.
   * @return {this} The copy of the set without the value.
   */
  public delete(value: T): ImmutableEquatableSet<T> {
    const found = this._find(value)
    if (found) {
      const newCopy = new ImmutableEquatableSet<T>(this._set)
      newCopy._set.delete(found)
      return newCopy
    }
    return this
  }

  /**
   * Get the size of the set.
   *
   * @return {number} The size of the set.
   */
  public get size(): number {
    return this._set.size
  }

  // Find a specific value in the set, using the .equals() for equality
  private _find(value: T): T | null {
    for (const v of this._set) {
      if (v.equals(value)) {
        return v
      }
    }
    return null
  }

  // Method to convert to array
  toArray(): T[] {
    return Array.from(this._set)
  }

  // Method to iterate over the set
  [Symbol.iterator](): IterableIterator<T> {
    return this._set[Symbol.iterator]()
  }
}

/**
 * An immutable set of coordinates. It uses the `Coord.equals` method to check for equality.
 */
export class CoordSet extends ImmutableEquatableSet<Coord> {}
