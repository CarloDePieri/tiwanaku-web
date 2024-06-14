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
