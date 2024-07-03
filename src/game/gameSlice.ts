import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"
import * as Comlink from "comlink"
import { RootState } from "../app/store.ts"
import { ComlinkPayload } from "../worker.ts"
import { GameBoard, BoardSize, SerializedBoard } from "./GameBoard.ts"
import { GameCell, SerializedCell } from "./GameCell.ts"

export type BoardUiState = "loading" | "loaded" | "empty"

export interface GameState {
  board: SerializedBoard | null
  boardTransition: boolean
  boardUiState: BoardUiState
  cache: {
    [key in BoardSize]: {
      requestPending: boolean
      generating: boolean
      boards: SerializedBoard[]
    }
  }
}

const initialState: GameState = {
  board: null,
  boardTransition: false,
  boardUiState: "empty",
  cache: {
    small: {
      generating: false,
      requestPending: false,
      boards: [],
    },
    standard: {
      generating: false,
      requestPending: false,
      boards: [],
    },
  },
}

// Async reducer for generating the board in a web worker thread
const generateNewBoard = createAsyncThunk(
  "gameState/generateBoard",
  async (size: BoardSize) => {
    // Spin up a web worker
    const webWorker = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    })
    const link = Comlink.wrap<ComlinkPayload>(webWorker)
    // Run the generateBoard function in the web worker
    return await link.generateBoard(size)
  },
)

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// async reducer that picks a board from the cache, waiting for one to be generated, if needed
const pickFromCache = createAsyncThunk(
  "gameState/pickFromCache",
  (size: BoardSize, { dispatch, getState }) => {
    // eslint no-async-promise-executor: it actually needs to be async
    return new Promise<boolean>(async (resolve, reject) => {
      // call this function to get the most up-to-date state
      const getUpToDateState = () => getState() as RootState

      // reject this request if there is already a request pending for this size
      if (getUpToDateState().cache[size].requestPending) {
        reject(new Error("Already pending"))
        return false
      }
      dispatch(toggleRequestPending(size))

      if (getUpToDateState().cache[size].boards.length <= 0) {
        let counter = 0
        // start a board transition
        dispatch(setBoardTransition(true))
        await sleep(250)
        dispatch(setBoardUiState("loading"))
        await sleep(250)
        dispatch(setBoardTransition(false))

        // Wait for a board to be cached
        while (getUpToDateState().cache[size].boards.length <= 0) {
          if (counter > 20) {
            // this should not happen
            dispatch(setBoardUiState("empty"))
            reject(new Error("Timeout"))
            return false
          }
          await sleep(500)
          counter++
        }
      }

      // start a board transition
      dispatch(setBoardTransition(true))
      await sleep(250)
      // pick the board from the cache
      dispatch(pickBoard(size))
      await sleep(250)
      dispatch(setBoardTransition(false))
      dispatch(setBoardUiState("loaded"))
      // conclude the board transition

      resolve(true)
      return true
    })
  },
)

export const gameSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {
    pickBoard: (state, action: PayloadAction<BoardSize>) => {
      if (state.cache[action.payload].boards.length > 0)
        state.board = state.cache[action.payload].boards.pop()!
    },
    setBoardUiState: (state, action: PayloadAction<BoardUiState>) => {
      state.boardUiState = action.payload
    },
    setBoardTransition: (state, action: PayloadAction<boolean>) => {
      state.boardTransition = action.payload
    },
    toggleRequestPending: (state, action: PayloadAction<BoardSize>) => {
      state.cache[action.payload].requestPending =
        !state.cache[action.payload].requestPending
    },
    nextStep: (state, action: PayloadAction<SerializedCell>) => {
      if (state.board) {
        const cell = GameCell.deserialize(action.payload)
        const updatedCell = cell.isFieldHidden
          ? cell.copyAndDiscoverField()
          : cell.copyAndDiscoverCrop()
        const board = GameBoard.fromSerializedBoard(state.board)
        const updatedBoard = board.copyWithCell(updatedCell)
        state.board = updatedBoard.getSerializedBoard()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // generateNewBoard handlers
      .addCase(generateNewBoard.pending, (state, action) => {
        const size = action.meta.arg
        state.cache[size].generating = true
      })
      .addCase(generateNewBoard.fulfilled, (state, action) => {
        const size = action.meta.arg
        state.cache[size].boards.push(action.payload)
        state.cache[size].generating = false
      })
      .addCase(
        generateNewBoard.rejected,
        (state, { meta: { aborted, arg } }) => {
          state.cache[arg].generating = false
          if (aborted) console.log("Board generation aborted by the user")
        },
      )
      // pickFromCache handlers
      .addCase(pickFromCache.fulfilled, (state, { meta: { arg } }) => {
        state.cache[arg].requestPending = false
      })
      .addCase(pickFromCache.rejected, (state, { meta: { arg } }) => {
        state.cache[arg].requestPending = false
      })
  },
})

// Selectors
export const selectBoard = createSelector(
  [(state: RootState) => state.board],
  (board: SerializedBoard | null) =>
    board ? GameBoard.fromSerializedBoard(board) : null,
)
export const selectBoardTransition = (state: RootState) => state.boardTransition
export const selectBoardUiState = (state: RootState) => state.boardUiState
export const selectGeneratingBoard = (size: BoardSize) => (state: RootState) =>
  state.cache[size].generating
export const selectCachedSmallBoards = (state: RootState) =>
  state.cache.small.boards
export const selectCachedStandardBoards = (state: RootState) =>
  state.cache.standard.boards

// Actions
export const {
  pickBoard,
  nextStep,
  toggleRequestPending,
  setBoardTransition,
  setBoardUiState,
} = gameSlice.actions
export { generateNewBoard, pickFromCache }

export default gameSlice.reducer
