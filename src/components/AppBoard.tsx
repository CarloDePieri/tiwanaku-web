import { useEffect, useRef, useState } from "react"
import backgroundImage from "../assets/background.png"
import { GameBoard } from "../game/GameBoard.ts"
import { AppCell } from "./AppCell.tsx"
import { CenteringDiv } from "./CenteringDiv.tsx"

export function AppBoard({
  board,
  width,
  height,
}: Readonly<{ board: GameBoard; width: number; height: number }>) {
  const [cellSize, setCellSize] = useState(0)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const boardWidth = boardRef.current.offsetWidth
        const boardHeight = boardRef.current.offsetHeight
        const cellWidth = boardWidth / board.board[0].length
        const cellHeight = boardHeight / board.board.length
        setCellSize(Math.min(cellWidth, cellHeight))
      }
    }

    // delay the first update to make sure the ref is set
    setTimeout(() => updateCellSize(), 500)
    window.addEventListener("resize", updateCellSize)
    return () => window.removeEventListener("resize", updateCellSize)
  }, [board])

  return (
    <CenteringDiv
      style={{
        height: `${height}%`,
        width: `${width}%`,
      }}
    >
      <CenteringDiv
        style={{
          height: "95%",
          width: "95%",
          padding: "1%",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CenteringDiv divRef={boardRef} style={{ overflow: "hidden" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${board.board[0].length}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${board.board.length}, ${cellSize}px)`,
              backgroundColor: "rgba(255, 255, 255, 0.4)",
            }}
          >
            {board.board.map((row, y) =>
              row.map((_, x) => {
                const cell = board.getCell(x, y)
                return (
                  <AppCell
                    key={`coord_${cell.coordinates.x}_${cell.coordinates.y}`}
                    cell={cell}
                  />
                )
              }),
            )}
          </div>
        </CenteringDiv>
      </CenteringDiv>
    </CenteringDiv>
  )
}
