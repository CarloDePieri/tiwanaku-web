interface Equatable<T> {
  equals(other: T): boolean
}

// noinspection JSValidateJSDoc
/**
 * An immutable set of equatable elements.
 * It uses the `Equatable.equals` method to check for equality.
 */
export class ImmutableEquatableSet<T extends Equatable<T>> {
  protected readonly _set: Set<T>

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

  /**
   * Creates a new set with all elements that pass the test implemented by the provided function.
   *
   * @param {(value: T) => boolean} fn - A predicate function to test each element of the set.
   * Return `true` to keep the element, `false` otherwise. It accepts an argument:
   * `value`: The current element being processed in the set.
   *
   * @return {ImmutableEquatableSet<T>} A new set with the elements that pass the test.
   * If no elements pass the test, an empty set will be returned.
   */
  public filter(fn: (value: T) => boolean): ImmutableEquatableSet<T> {
    let newSet = new ImmutableEquatableSet<T>()
    for (const value of this) {
      if (fn(value)) {
        newSet = newSet.add(value)
      }
    }
    return newSet
  }

  /**
   * Creates a new set with the results of calling a provided function on every element in the calling set.
   *
   * @param {function} fn - The function to execute on each element.
   * @return {ImmutableEquatableSet} A new set with each element being the result of the function.
   */
  public map<U extends Equatable<U>>(
    fn: (value: T) => U,
  ): ImmutableEquatableSet<U> {
    let newSet = new ImmutableEquatableSet<U>()
    for (const value of this) {
      newSet = newSet.add(fn(value))
    }
    return newSet
  }

  /**
   * Applies a function to each element in the set that returns a set for each element, and then flattens the result into a new set.
   *
   * @param {function} fn - The function to execute on each element, which returns a set.
   * @return {ImmutableEquatableSet} A new flattened set.
   */
  public flatMap<U extends Equatable<U>>(
    fn: (value: T) => ImmutableEquatableSet<U>,
  ): ImmutableEquatableSet<U> {
    let newSet = new ImmutableEquatableSet<U>()
    for (const value of this) {
      const innerSet = fn(value)
      for (const innerValue of innerSet) {
        newSet = newSet.add(innerValue)
      }
    }
    return newSet
  }

  /**
   * Creates a new set with all elements that are in this set but not in the other set.
   *
   * @param {ImmutableEquatableSet<T>} other - The set to compare with.
   *
   * @return {ImmutableEquatableSet<T>} A new set with the elements that are in this set but not in the other set.
   * If no elements are different, an empty set will be returned.
   */
  public difference(other: ImmutableEquatableSet<T>): ImmutableEquatableSet<T> {
    return this.filter((coord) => !other.has(coord))
  }

  // Find a specific value in the set, using the .equals() for equality
  private _find(value: T): T | null {
    for (const v of this) {
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
