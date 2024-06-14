import { GameConfig, GameController } from "./GameController.ts"
import { State } from "./State.ts"

// mocking utility for exposing selected private methods and fields
const expose = (gameController: GameController) => {
  return {
    seedOnes: (): State => gameController["seedOnes"](),
  }
}

describe("A GameController", () => {
  const boardWidth = 5
  const boardHeight = 5
  const minGroup = 6
  const maxGroup = 8
  const config = new GameConfig(boardWidth, boardHeight, 25, minGroup, maxGroup)
  const gameController = new GameController(config)

  describe("when seeding ones", () => {
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
})
