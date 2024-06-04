import { Board } from "../game/structures.ts"
import Square from "./Square.tsx"
import useWindowDimensions from "./useWindowDimensions.ts"

interface BoardProps {
  board: Board
  cellMargin: number
  targetVW: number
  targetVH: number
  maxVW: number
  maxVH: number
}

export default function GameBoard({
  board,
  cellMargin,
  maxVW,
  maxVH,
  targetVW,
  targetVH,
}: Readonly<BoardProps>) {
  const dim = useWindowDimensions()
  const screenSizeRatio = dim.width / dim.height

  const isSmall = board.width === 5

  let unit
  let widthStr
  let heightStr
  let cellH
  let cellW

  if (isSmall) {
    unit = screenSizeRatio > 1 ? "vh" : "vw"

    cellH = Math.floor(targetVW / board.width) - 1
    cellW = Math.floor(targetVH / board.height) - 1

    widthStr = `${targetVW}${unit}`
    heightStr = `${targetVH}${unit}`
  } else {
    let width
    let height
    const boardSizeRatio = board.width / board.height

    if (screenSizeRatio > boardSizeRatio) {
      unit = "vh"

      height = targetVH
      width = Math.floor(height * boardSizeRatio)

      cellH = Math.floor(width / board.width) - 0.8
      cellW = Math.floor(width / board.width) - 0.8
    } else {
      // landscape, with a ratio smaller than the board OR portrait
      unit = "vw"

      width = targetVW
      height = Math.floor(width / boardSizeRatio)

      cellH = Math.floor(height / board.height) - 0.2
      cellW = Math.floor(height / board.height) - 0.2
    }

    widthStr = `${width}${unit}`
    heightStr = `${height}${unit}`
  }

  return (
    <div
      style={{
        width: widthStr,
        height: heightStr,
        maxWidth: `${maxVW}vw`,
        maxHeight: `${maxVH}vh`,
      }}
    >
      {board.getBoard().map((row, y) => {
        return (
          // TODO fix the key
          <div style={{ display: "flex" }} key={`row_${y}`}>
            {row.map((_, x) => {
              const square = board.getCell(x, y)
              return (
                <Square
                  width={`${cellW}${unit}`}
                  height={`${cellH}${unit}`}
                  margin={`${cellMargin}${unit}`}
                  key={`coord_${square.coordinates.x}_${square.coordinates.y}`}
                  field={square.field}
                  size={square.crop}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
