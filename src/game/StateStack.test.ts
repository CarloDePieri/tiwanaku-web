import { State } from "./State.ts"
import { StateStack } from "./StateStack.ts"

// utils
const getMockState = (stateHash: string) =>
  ({ hash: stateHash }) as unknown as State

describe("A state stack", () => {
  const stepMaxTries = 2
  let stack: StateStack
  const mockState1 = getMockState("state1")
  const mockState2 = getMockState("state2")

  beforeEach(() => {
    stack = new StateStack(stepMaxTries)
  })

  it("should store valid state", () => {
    stack.pushValid(mockState1)
    expect(stack.lastState.hash).toBe("state1")
  })

  it("should invalidate a state only after the given maxTries", () => {
    stack.pushValid(mockState1)
    stack.markInvalid()
    expect(stack.lastState.hash).toBe("state1")
    expect(stack.empty).toBe(false)
    stack.markInvalid()
    expect(stack.empty).toBe(true)
  })

  it("should store invalidated state hash", () => {
    stack.pushValid(mockState1)
    stack.pushValid(mockState2)
    stack.markInvalid()
    stack.markInvalid()
    expect(stack.lastStateBlacklist).toEqual(["state2"])
  })

  it("should propagate errors from children to parents", () => {
    stack.pushValid(mockState1)
    stack.pushValid(mockState2)
    // it should only take three tries to invalidate both
    stack.markInvalid()
    stack.markInvalid()
    stack.markInvalid()
    expect(stack.empty).toBe(true)
  })

  it("should indicate what the next Crop is supposed to be", () => {
    expect(stack.nextCrop).toBe(1)
    stack.pushValid(mockState1)
    expect(stack.nextCrop).toBe(2)
    stack.pushValid(mockState2)
    expect(stack.nextCrop).toBe(3)
  })

  it("should mark the stack full after 5 valid step", () => {
    expect(stack.full).toBe(false)
    stack.pushValid(mockState1)
    stack.pushValid(mockState1)
    stack.pushValid(mockState1)
    stack.pushValid(mockState1)
    stack.pushValid(mockState1)
    expect(stack.full).toBe(true)
  })
})
