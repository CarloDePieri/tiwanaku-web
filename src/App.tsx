import "./App.css"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks.ts"
import Board from "./components/Board.tsx"
import {
  abortNewBoardGeneration,
  generateNewBoard,
  GenerateNewBoardPromise,
  selectGeneratingBoard,
} from "./game/gameSlice.ts"
import { BoardSize } from "./game/GameBoard.ts"

function App() {
  const [promise, setPromise] = useState<GenerateNewBoardPromise | null>(null)

  const loading = useAppSelector(selectGeneratingBoard)
  const dispatch = useAppDispatch()

  function abortGeneration() {
    // stop the current generation
    if (promise) abortNewBoardGeneration(promise)
  }

  const generate = (size: BoardSize) => {
    // if there was a previous request, cancel it
    if (loading) {
      abortGeneration()
    }
    setPromise(dispatch(generateNewBoard(size)))
  }

  return (
    <div>
      <div>
        <button onClick={() => generate("small")}>small</button>
        <button onClick={() => generate("standard")}>standard</button>
        {loading && (
          <>
            <span> Generating... </span>
            <button onClick={() => abortGeneration()}>Abort</button>
          </>
        )}
      </div>
      <Board />
    </div>
  )
}

export default App
