import { IncompleteCell } from "./Cell.ts"
import { Crop } from "../game/enums.ts"
import { GameConfig, GameGenerator } from "./GameGenerator.ts"
import { State } from "./State.ts"

// mocking utility for exposing selected private methods and fields
const expose = (gameController: GameGenerator) => {
  return {
    seedOnes: (): State => gameController["seedOnes"](),
    depthFirstGrowth: (state: State): State =>
      gameController["depthFirstGrowth"](state),
    breadthFirstGrowth: (state: State): State =>
      gameController["breadthFirstGrowth"](state),
    generateFirstStep: (strategies?: ((state: State) => State)[]): State =>
      gameController["generateFirstStep"](strategies),
    plantCrop: (
      crop: Crop,
      state: State,
      groupsToPlant: number[],
    ): State | null => gameController["plantCrop"](crop, state, groupsToPlant),
  }
}

const tenTimes = ((n) => Array.from({ length: n }, (_, i) => (i % n) + 1))(10)

describe("A GameGenerator", () => {
  const boardWidth = 5
  const boardHeight = 5
  const minGroup = 6
  const maxGroup = 8
  const config = new GameConfig(
    boardWidth,
    boardHeight,
    10,
    5,
    minGroup,
    maxGroup,
  )
  let gameController: GameGenerator
  let exposed: ReturnType<typeof expose>

  beforeAll(() => {
    gameController = new GameGenerator(config)
    exposed = expose(gameController)
  })

  describe.each(tenTimes)("when seeding ones (%d out of 10)", () => {
    let state: State

    beforeAll(() => {
      state = exposed.seedOnes()
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
      describe.each(tenTimes)("(%d run out of 10)", () => {
        let state: State

        beforeAll(() => {
          // select the strategy
          const strategy =
            strategyName === "DFS"
              ? exposed.depthFirstGrowth
              : exposed.breadthFirstGrowth
          // generate the first step
          state = exposed.generateFirstStep([strategy.bind(gameController)])
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

  describe.each(tenTimes)(
    "when placing crops and succeeding (%d out of 10)",
    () => {
      let nextStep: State | null = null
      let cellWithTwo: IncompleteCell[]
      let groupsToPlant: number[]

      beforeAll(() => {
        while (nextStep === null) {
          // keep trying to place crops until it succeeds
          const step = exposed.generateFirstStep()
          groupsToPlant = [...step.groups.entries()]
            .filter(([, group]) => group.size >= 2)
            .map(([id]) => id)
          nextStep = exposed.plantCrop(Crop.two, step, groupsToPlant)
        }
        cellWithTwo = nextStep!.board
          .flat()
          .filter((cell) => cell.crop === Crop.two)
      })

      it("should place enough crop", () => {
        expect(cellWithTwo.length).toBe(groupsToPlant.length)
      })

      it("should place crops correctly", () => {
        let thereIsAtLeastOneTwo = false
        for (const coord of cellWithTwo.flatMap((cell) =>
          cell.coordinates.getNeighbors(boardHeight, boardWidth),
        )) {
          // these are all the cells neighboring a cell with crop 2: they should not be 2 themselves
          expect(nextStep!.getCell(coord.x, coord.y).crop).not.toBe(Crop.two)
          thereIsAtLeastOneTwo = true
        }
        expect(thereIsAtLeastOneTwo).toBe(true)
      })
    },
  )

  // TODO why is the standard board so slow?
  // describe.each(["small"])(
  describe.each(["small", "standard"])(
    "when generating a %s board",
    (boardSize: string) => {
      let state: State
      let boardWidth: number
      let boardHeight: number
      let minGroup: number
      let maxGroup: number

      // describe.each(tenTimes)("(%d run out of 10)", () => {
      describe("(1 run out of 1)", () => {
        beforeAll(() => {
          if (boardSize === "small") {
            boardWidth = 5
            boardHeight = 5
            minGroup = 6
            maxGroup = 8
            state = gameController.generateBoard()
          } else {
            boardWidth = 9
            boardHeight = 5
            minGroup = 10
            maxGroup = 14
            const configStandard = new GameConfig(
              boardWidth,
              boardHeight,
              5,
              5,
              minGroup,
              maxGroup,
            )
            gameController = new GameGenerator(configStandard)
            state = gameController.generateBoard()
          }
        })

        it("should be a valid board", () => {
          expect(state.boardHeight).toBe(boardHeight)
          expect(state.boardWidth).toBe(boardWidth)
          expect(state.groups.size).toBeGreaterThanOrEqual(minGroup)
          expect(state.groups.size).toBeLessThanOrEqual(maxGroup)

          for (const cell of state.board.flat()) {
            expect(cell.groupId).toBeDefined()
            expect(cell.field).toBeDefined()
            expect(cell.crop).toBeDefined()
            const neighbors = cell.coordinates
              .getNeighbors(boardHeight, boardWidth)
              .map((coord) => state.getCell(coord.x, coord.y))
            for (const neighbor of neighbors) {
              // if they have different groupId they must have different fields
              if (neighbor.groupId !== cell.groupId) {
                expect(neighbor.field).not.toBe(cell.field)
              }
              // they must have a different crop
              expect(neighbor.crop).not.toBe(cell.crop)
            }
          }
        })
      })
    },
  )
})