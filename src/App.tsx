import "./App.css"
import { useState, useTransition } from "react"
import { BoardLoader } from "./components/BoardLoader.tsx"
import GameBoard from "./components/GameBoard.tsx"
import { generateBoard } from "./game/procedures.ts"
import { Board } from "./game/structures.ts"

function App() {
  const [board, setBoard] = useState<Board>(new Board([]))
  const [size, setSize] = useState<"small" | "standard">("small")

  const [isPending, startTransition] = useTransition()

  const generate = (size: "small" | "standard") => {
    startTransition(() => {
      setSize(size)
      // TODO this should not block the UI
      generateBoard(size).then((board) => {
        setBoard(board)
      })
    })
  }

  const gameBoard = isPending ? (
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
      board={board}
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
