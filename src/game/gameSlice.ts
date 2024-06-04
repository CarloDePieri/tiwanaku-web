import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit"
import * as Comlink from "comlink"
import { RootState } from "../app/store.ts"
import { ComlinkPayload } from "../worker.ts"
import { Board, BoardSize, SerializedBoard } from "./structures.ts"

export interface GameState {
  generatingBoard: boolean
  board: SerializedBoard | null
}

const initialState: GameState = {
  generatingBoard: false,
  board: null,
}

// Async reducer for generating the board in a web worker thread
const generateNewBoard = createAsyncThunk(
  "gameState/generateBoard",
  async (size: BoardSize) => {
    // Prepare the web worker
    const worker = Comlink.wrap<ComlinkPayload>(
      new Worker(new URL("../worker.ts", import.meta.url), {
        type: "module",
      }),
    )
    // Run the generateBoard function in the web worker
    return await worker.generateBoard(size)
  },
)

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
      .addCase(generateNewBoard.rejected, (state) => {
        state.generatingBoard = false
        // TODO signal some error message
      })
  },
})

// Selectors
export const selectBoard = createSelector(
  [(state: RootState) => state.board],
  (board: SerializedBoard | null) => (board ? Board.deserialize(board) : null),
)
export const selectGeneratingBoard = (state: RootState) => state.generatingBoard

// Actions
// export const {} = gameSlice.actions
export { generateNewBoard }

export default gameSlice.reducer
