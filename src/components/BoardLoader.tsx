import ContentLoader from "react-content-loader"
import backgroundImageDark from "../assets/background-dark.png"
import useWindowDimensions from "./useWindowDimensions.ts"

interface BoardLoaderProps {
  size: "small" | "standard"
  cellMargin: number
  targetVW: number
  targetVH: number
  maxVW: number
  maxVH: number
}

export function BoardLoader({
  size,
  cellMargin,
  maxVW,
  maxVH,
  targetVW,
  targetVH,
}: Readonly<BoardLoaderProps>) {
  const dim = useWindowDimensions()
  const screenSizeRatio = dim.width / dim.height

  let unit
  let height
  let width
  let widthStr
  let heightStr
  let cellY
  let cellX
  let cellH
  let cellW

  if (size === "small") {
    unit = screenSizeRatio > 1 ? "vh" : "vw"

    width = targetVW

    cellY = 5
    cellX = 5

    cellH = Math.floor(width / cellY) - 1
    cellW = Math.floor(width / cellX) - 1

    widthStr = `${width}${unit}`
    heightStr = `${width}${unit}`
  } else {
    cellY = 5
    cellX = 9
    const boardSizeRatio = cellX / cellY

    if (screenSizeRatio > boardSizeRatio) {
      // landscape, with a ratio bigger than the board
      unit = "vh"

      height = targetVH
      width = Math.floor(height * boardSizeRatio)

      cellH = Math.floor(width / cellX) - 0.8
      cellW = Math.floor(width / cellX) - 0.8
    } else {
      // landscape, with a ratio smaller than the board OR portrait
      unit = "vw"

      width = targetVW
      height = Math.floor(width / boardSizeRatio)

      cellH = Math.floor(height / cellY) - 0.2
      cellW = Math.floor(height / cellY) - 0.2
    }
    widthStr = `${width}${unit}`
    heightStr = `${height}${unit}`
  }

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImageDark})`,
        backgroundSize: "cover",
        display: "inline-flex",
        paddingLeft: `2${unit}`,
        paddingTop: `1${unit}`,
      }}
    >
      <ContentLoader
        width={widthStr}
        height={heightStr}
        backgroundColor="#f3f3f3"
        foregroundColor="#6b6b6b"
        speed={3}
        style={{
          maxWidth: `${maxVW}vw`,
          maxHeight: `${maxVH}vh`,
          filter: "opacity(0.5)",
        }}
      >
        {Array(cellY)
          .fill(0)
          .map((_, i) =>
            Array(cellX)
              .fill(0)
              .map((_, j) => {
                return (
                  <rect
                    x={`${j * (cellW + cellMargin)}${unit}`}
                    y={`${i * (cellH + cellMargin)}${unit}`}
                    width={`${cellW}${unit}`}
                    height={`${cellH}${unit}`}
                    key={`cell_${i}_${j}`}
                  />
                )
              }),
          )}
      </ContentLoader>
    </div>
  )
}
