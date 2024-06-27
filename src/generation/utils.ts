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
