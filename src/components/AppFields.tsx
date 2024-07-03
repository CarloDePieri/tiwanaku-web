import { useEffect, useRef, useState } from "react"
import { useAppSelector } from "../app/hooks.ts"
import { Field } from "../game/enums.ts"
import { GameBoard } from "../game/GameBoard.ts"
import { selectBoardUiState } from "../game/gameSlice.ts"
import { getFieldImage } from "./getAssets.ts"
import "./AppFields.css"

import { CenteringDiv } from "./CenteringDiv.tsx"

function AppField({ field, num }: Readonly<{ field: Field; num: number }>) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.0)",
          backgroundImage: `url(${getFieldImage(field)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className={"d-flex align-items-center game-field"}
      >
        <div className={"mx-auto game-field--text"}>{num}</div>
      </div>
    </div>
  )
}

export function AppFields({
  width,
  height,
  board,
}: Readonly<{ width: number; height: number; board: GameBoard }>) {
  const boardUiState = useAppSelector(selectBoardUiState)
  const fields = Object.values(Field).map((field) => (
    <AppField key={field} field={field} num={board.undiscoveredFields[field]} />
  ))

  const [hintSize, setHintSize] = useState(0)
  const hintTableRef = useRef<HTMLDivElement>(null)

  const isOnTheSide = width === 100
  const hintsTableCols = isOnTheSide ? 4 : 1
  const hintsTableRows = isOnTheSide ? 1 : 4

  useEffect(() => {
    const updateHintSize = () => {
      if (hintTableRef.current) {
        const hintTableWidth = hintTableRef.current.offsetWidth
        const hintTableHeight = hintTableRef.current.offsetHeight
        const hintWidth = hintTableWidth / hintsTableCols
        const hintHeight = hintTableHeight / hintsTableRows
        setHintSize(Math.min(hintWidth, hintHeight))
      }
    }
    updateHintSize()
    window.addEventListener("resize", updateHintSize)
    return () => window.removeEventListener("resize", updateHintSize)
  }, [hintsTableRows, hintsTableCols])

  return boardUiState === "loaded" ? (
    <CenteringDiv
      style={{
        height: `${height}%`,
        width: `${width}%`,
      }}
    >
      <CenteringDiv divRef={hintTableRef} style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${hintsTableCols}, ${hintSize}px)`,
            gridTemplateRows: `repeat(${hintsTableRows}, ${hintSize}px)`,
          }}
        >
          {fields}
        </div>
      </CenteringDiv>
    </CenteringDiv>
  ) : (
    <></>
  )
}
