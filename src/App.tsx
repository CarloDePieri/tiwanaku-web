import "./App.css"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks.ts"
import { BoardLoader } from "./components/BoardLoader.tsx"
import GameBoard from "./components/GameBoard.tsx"
import {
  abortNewBoardGeneration,
  generateNewBoard,
  GenerateNewBoardPromise,
  selectGeneratingBoard,
} from "./game/gameSlice.ts"
import { BoardSize } from "./game/GameBoard.ts"

function App() {
  const [size, setSize] = useState<BoardSize>("small")
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
    setSize(size)
    setPromise(dispatch(generateNewBoard(size)))
  }

  const gameBoard = loading ? (
    <BoardLoader
      size={size}
      cellMargin={0.5}
      maxVH={95}
      maxVW={95}
      targetVW={95}
      targetVH={95}
    />
  ) : (
    <GameBoard
      cellMargin={0.25}
      maxVH={95}
      maxVW={95}
      targetVW={95}
      targetVH={95}
    />
  )

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
      {gameBoard}
    </div>
  )
}

export default App
