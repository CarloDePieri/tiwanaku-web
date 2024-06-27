import { useAppSelector } from "../app/hooks.ts"
import { selectBoard } from "../game/gameSlice.ts"
import Square from "./Square.tsx"
import useWindowDimensions from "./useWindowDimensions.ts"
import backgroundImage from "../assets/background.png"

interface BoardProps {
  cellMargin: number
  targetVW: number
  targetVH: number
  maxVW: number
  maxVH: number
}

export default function BoardLoaded({
  cellMargin,
  maxVW,
  maxVH,
  targetVW,
  targetVH,
}: Readonly<BoardProps>) {
  const dim = useWindowDimensions()
  const board = useAppSelector(selectBoard)

  if (board === null) return <></>

  const screenSizeRatio = dim.width / dim.height

  const isSmall = board.boardWidth === 5

  let unit
  let widthStr
  let heightStr
  let cellH
  let cellW

  if (isSmall) {
    unit = screenSizeRatio > 1 ? "vh" : "vw"

    cellH = Math.floor(targetVW / board.boardWidth) - 1
    cellW = Math.floor(targetVH / board.boardHeight) - 1

    widthStr = `${targetVW}${unit}`
    heightStr = `${targetVH}${unit}`
  } else {
    let width
    let height
    const boardSizeRatio = board.boardWidth / board.boardHeight

    if (screenSizeRatio > boardSizeRatio) {
      unit = "vh"

      height = targetVH
      width = Math.floor(height * boardSizeRatio)

      cellH = Math.floor(width / board.boardWidth) - 0.8
      cellW = Math.floor(width / board.boardWidth) - 0.8
    } else {
      // landscape, with a ratio smaller than the board OR portrait
      unit = "vw"

      width = targetVW
      height = Math.floor(width / boardSizeRatio)

      cellH = Math.floor(height / board.boardHeight) - 0.2
      cellW = Math.floor(height / board.boardHeight) - 0.2
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
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        {board.board.map((row, y) => {
          return (
            <div
              style={{ display: "flex" }}
              key={`row_${row[0].coordinates.y}`}
            >
              {row.map((_, x) => {
                const cell = board.getCell(x, y)
                return (
                  <Square
                    width={`${cellW}${unit}`}
                    height={`${cellH}${unit}`}
                    margin={`${cellMargin}${unit}`}
                    key={`coord_${cell.coordinates.x}_${cell.coordinates.y}`}
                    cell={cell}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
