import "./App.css"
import { useState } from "react"
import { BoardLoader } from "./components/BoardLoader.tsx"
import GameBoard from "./components/GameBoard.tsx"
import { Board } from "./game/structures.ts"
import { ComlinkPayload } from "./worker.ts"
import * as Comlink from "comlink"

function App() {
  const [board, setBoard] = useState<Board>(new Board([]))
  const [size, setSize] = useState<"small" | "standard">("small")
  const [loading, setLoading] = useState(false)

  const worker = Comlink.wrap<ComlinkPayload>(
    new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    }),
  )

  // TODO cancel previous request if a new one is made
  const generate = (size: "small" | "standard") => {
    setLoading(true)
    setSize(size)
    worker
      .generateBoard(size)
      .then((serializedBoard) => {
        if (serializedBoard !== null) {
          setBoard(Board.deserialize(serializedBoard))
        } else {
          // TODO
          console.log("ERROR")
        }
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setLoading(false)
      })
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
