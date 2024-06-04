import "./App.css"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "./app/hooks.ts"
import { BoardLoader } from "./components/BoardLoader.tsx"
import GameBoard from "./components/GameBoard.tsx"
import { generateNewBoard, selectGeneratingBoard } from "./game/gameSlice.ts"
import { BoardSize } from "./game/structures.ts"

function App() {
  const [size, setSize] = useState<BoardSize>("small")

  const loading = useAppSelector(selectGeneratingBoard)
  const dispatch = useAppDispatch()

  // TODO cancel previous request if a new one is made
  const generate = (size: BoardSize) => {
    setSize(size)
    dispatch(generateNewBoard(size))
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
      </div>
      {gameBoard}
    </div>
  )
}

export default App
