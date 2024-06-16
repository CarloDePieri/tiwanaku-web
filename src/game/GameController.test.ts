import { GameConfig, GameController } from "./GameController.ts"
import { State } from "./State.ts"

// mocking utility for exposing selected private methods and fields
const expose = (gameController: GameController) => {
  return {
    seedOnes: (): State => gameController["seedOnes"](),
    depthFirstGrowth: (state: State): State =>
      gameController["depthFirstGrowth"](state),
    breadthFirstGrowth: (state: State): State =>
      gameController["breadthFirstGrowth"](state),
    growGroups: (
      state: State,
      strategy: (state: State) => State,
    ): State | null => gameController["growGroups"](state, strategy),
  }
}

const tenTimes = ((n) => Array.from({ length: n }, (_, i) => (i % n) + 1))(10)

describe("A GameController", () => {
  const boardWidth = 5
  const boardHeight = 5
  const minGroup = 6
  const maxGroup = 8
  const config = new GameConfig(
    boardWidth,
    boardHeight,
    25,
    5,
    minGroup,
    maxGroup,
  )
  const gameController = new GameController(config)

  describe.each(tenTimes)("when seeding ones (%d out of 10)", () => {
    let state: State

    beforeAll(() => {
      state = expose(gameController).seedOnes()
    })

    it("should be able to generate the board with the correct number of groups", () => {
      expect(state.boardHeight).toBe(5)
      expect(state.boardWidth).toBe(5)
      expect(state.groups.size).toBeGreaterThanOrEqual(minGroup)
      expect(state.groups.size).toBeLessThanOrEqual(maxGroup)
    })

    it("should assign a field to each group", () => {
      for (const group of state.groups.values()) {
        expect(group.field).toBeDefined()
      }
    })

    it("should generate a correct board", () => {
      for (const coord of state.board
        .flat()
        .filter((cell) => cell.crop === 1)
        .flatMap((cell) =>
          cell.coordinates.getNeighbors(boardHeight, boardWidth),
        )) {
        // these are all the cells neighboring a cell with crop 1: they should be empty
        expect(state.getCell(coord.x, coord.y).crop).toBeUndefined()
      }
    })
  })
  describe.each(["DFS", "BFS"])(
    "when growing groups with %s",
    (strategyName) => {
      // repeat this 11 times to ensure that the growth does not cause any issues
      describe.each(tenTimes)("(%d run out of 10)", () => {
        let state: State

        beforeAll(() => {
          const exposed = expose(gameController)
          const strategy =
            strategyName === "DFS"
              ? exposed.depthFirstGrowth
              : exposed.breadthFirstGrowth
          let candidate: State | null = null
          while (candidate === null) {
            // redo the seeding every time to ensure a clean state
            state = exposed.seedOnes()
            candidate = exposed.growGroups(state, strategy)
          }
          state = candidate
        })

        it("should not cause different groups with same field touch", () => {
          for (const cell of state.board.flat()) {
            const neighbors = cell.coordinates
              .getNeighbors(boardHeight, boardWidth)
              .map((coord) => state.getCell(coord.x, coord.y))

            for (const neighbor of neighbors) {
              // if they have different groupId they must have different fields
              if (neighbor.groupId !== cell.groupId) {
                expect(neighbor.field).not.toBe(cell.field)
              }
            }
          }
        })

        it("should assign all cells to a group", () => {
          for (const cell of state.board.flat()) {
            expect(cell.groupId).toBeDefined()
          }
        }, 5000)
      })
    },
  )
})
