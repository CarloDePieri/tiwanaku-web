import { Equatable } from "./Coord.ts"

// noinspection JSValidateJSDoc
/**
 * Return a shallow copy of the given array shuffled with the Fisher-Yates
 * (also known as Knuth) algorithm.
 *
 * @param {T[]} array - The array to be shuffled.
 * @return {T[]} The shuffled array.
 */
export function shuffledCopy<T>(array: T[]): T[] {
  const newArray = array.slice(0)
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// noinspection JSValidateJSDoc
/**
 * Pick a random element from an array. If the array is empty, returns null.
 *
 * @param {Array<T>} array - The array to pick from.
 * @return {T | null} A random element from the given array, or null if the array is empty.
 */
export function pickRandom<T>(array: Array<T>): T | null {
  return array.length === 0
    ? null
    : array[Math.floor(Math.random() * array.length)]
}

/**
 * Get a random integer between min and max (inclusive).
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @return {number} A random integer between min and max (inclusive).
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// noinspection JSValidateJSDoc
/**
 * Get a random element from a list of values with a given percentage chance assigned.
 * The sum of all percentages must be 100.
 *
 * @param {[T, number]} values - A list of values with their respective percentage chance.
 * @return {T} The random value from the list.
 */
export function getRandomWithPercentage<T>(values: [T, number][]): T {
  if (values.reduce((acc, action) => acc + action[1], 0) !== 100) {
    throw new Error("The sum of all percentages must be 100.")
  }
  values.sort((a, b) => a[1] - b[1])
  const random = Math.random() * 100
  for (const value of values) {
    if (random <= value[1]) {
      return value[0]
    }
  }
  return values[values.length - 1][0]
}

// noinspection JSValidateJSDoc
/**
 * Filter duplicates from an iterable of equatable values.
 *
 * @param {Iterable<T>} values - The values to filter.
 * @return {T[]} An array with duplicates removed.
 */
export function filterDuplicates<T extends Equatable<T>>(
  values: Iterable<T>,
): T[] {
  const filteredValues: T[] = []
  if (values) {
    for (const value of values) {
      if (!filteredValues.some((v) => v.equals(value))) {
        filteredValues.push(value)
      }
    }
  }
  return filteredValues
}
