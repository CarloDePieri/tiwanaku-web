import { Crop } from "./enums.ts"
import { State } from "./State.ts"

/**
 * A step in the game state generation. Keeps track of failed generations.
 */
interface Step {
  state: State
  tries: number
  // board hash list of dead children board
  blacklist: string[]
}

/**
 * A stack of game states used to generate the game board.
 * Keeps track of failed generations.
 */
export class StateStack {
  private readonly steps: Step[]
  private readonly stepMaxTries: number

  /**
   * Create a StateStack.
   * @param {number} stepMaxTries - The maximum number of tries for each step.
   */
  constructor(stepMaxTries: number) {
    this.steps = []
    this.stepMaxTries = stepMaxTries
  }

  /**
   * Check if the stack is empty. This means that the board generation is failed.
   *
   * @return {boolean} True if the stack is empty, false otherwise.
   */
  get empty(): boolean {
    return this.steps.length === 0
  }

  /**
   * Check if the stack is full. This means that the board generation is successful
   * and the complete state is the last state in the stack.
   *
   * @return {boolean} True if the stack is full, false otherwise.
   */
  get full(): boolean {
    return this.steps.length === 5
  }

  /**
   * Get the last state in the stack. If the stack is full, this is the complete state.
   *
   * @return {State} The last state.
   */
  get lastState(): State {
    return this.lastStep.state
  }

  /**
   * Get the state hash blacklist of the last state in the stack. These are states that
   * failed to generate a valid board.
   *
   * @return {string[]} The blacklist of the last state.
   */
  get lastStateBlacklist(): string[] {
    return this.lastStep.blacklist
  }

  /**
   * Get the next crop to generate.
   *
   * @return {Crop} The next crop.
   */
  get nextCrop(): Crop {
    return (this.steps.length + 1) as Crop
  }

  /**
   * Push a valid state onto the stack.
   *
   * @param {State} state - The state to push.
   */
  pushValid(state: State) {
    this.steps.push({
      state,
      tries: 0,
      blacklist: [],
    })
  }

  /**
   * Mark the last state in the stack as invalid.
   * If the maximum number of tries for the last state is reached, remove it
   * from the stack and add it to the blacklist of its parent state.
   */
  markInvalid() {
    if (!this.empty) {
      // mark another failure
      this.lastStep.tries++
      if (this.lastStep.tries >= this.stepMaxTries) {
        // remove the last state from the stack
        const deadStep: Step = this.steps.pop()!
        if (!this.empty) {
          // add the dead state to the blacklist of the parent state
          this.lastStateBlacklist.push(deadStep.state.hash)
        }
        // propagate the error to its predecessor
        this.markInvalid()
      }
    }
  }

  // return the last step in the stack
  private get lastStep(): Step {
    return this.steps[this.steps.length - 1]
  }
}
