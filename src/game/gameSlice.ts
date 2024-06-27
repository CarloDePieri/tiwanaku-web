import {
  createAsyncThunk,
  createSelector,
  createSlice,
  SafePromise,
} from "@reduxjs/toolkit"
import {
  AsyncThunkConfig,
  AsyncThunkFulfilledActionCreator,
  AsyncThunkRejectedActionCreator,
  // @ts-expect-error - no types for createAsyncThunk
} from "@reduxjs/toolkit/dist/createAsyncThunk"
import * as Comlink from "comlink"
import { RootState } from "../app/store.ts"
import { ComlinkPayload } from "../worker.ts"
import { GameBoard, BoardSize, SerializedBoard } from "./GameBoard.ts"

export interface GameState {
  generatingBoard: boolean
  board: SerializedBoard | null
}

const initialState: GameState = {
  generatingBoard: false,
  board: null,
}

export type GenerateNewBoardPromise = SafePromise<
  | ReturnType<
      AsyncThunkFulfilledActionCreator<SerializedBoard | null, BoardSize>
    >
  | ReturnType<AsyncThunkRejectedActionCreator<BoardSize, AsyncThunkConfig>>
> & {
  abort: (reason?: string) => void
  requestId: string
  arg: BoardSize
  unwrap: () => Promise<SerializedBoard | null>
}

let webWorker: Worker

// Async reducer for generating the board in a web worker thread
const generateNewBoard = createAsyncThunk(
  "gameState/generateBoard",
  async (size: BoardSize) => {
    // Spin up a web worker
    webWorker = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    })
    const link = Comlink.wrap<ComlinkPayload>(webWorker)
    // Run the generateBoard function in the web worker
    return await link.generateBoard(size)
  },
)

const abortNewBoardGeneration = (promise: GenerateNewBoardPromise) => {
  // terminate the web worker who's generating the board
  webWorker?.terminate()
  // reject the promise
  promise.abort()
}

export const gameSlice = createSlice({
  name: "gameState",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateNewBoard.pending, (state) => {
        state.board = null
        state.generatingBoard = true
      })
      .addCase(generateNewBoard.fulfilled, (state, action) => {
        state.board = action.payload
        state.generatingBoard = false
      })
      .addCase(generateNewBoard.rejected, (state, { meta: { aborted } }) => {
        state.generatingBoard = false
        if (aborted) console.log("Board generation aborted by the user")
      })
  },
})

// Selectors
export const selectBoard = createSelector(
  [(state: RootState) => state.board],
  (board: SerializedBoard | null) =>
    board ? GameBoard.fromSerializedBoard(board) : null,
)
export const selectGeneratingBoard = (state: RootState) => state.generatingBoard

// Actions
// export const {} = gameSlice.actions
export { generateNewBoard, abortNewBoardGeneration }

export default gameSlice.reducer
