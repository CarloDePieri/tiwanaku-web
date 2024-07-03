import { useEffect, useRef, useState } from "react"
import { Spinner } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { GameCell } from "../game/GameCell.ts"
import { nextStep, selectBoardUiState } from "../game/gameSlice.ts"
import { getFieldImage, getCropImage } from "./getAssets.ts"
import "./AppCell.css"

export function AppCell({ cell }: Readonly<{ cell: GameCell }>) {
  const boardUiState = useAppSelector(selectBoardUiState)
  const [counter, setCounter] = useState(0)
  const dispatch = useAppDispatch()

  const runningRef = useRef<NodeJS.Timeout | null>(null)
  const counterRef = useRef<number>(0)

  useEffect(() => {
    counterRef.current = counter
  }, [counter])

  const startCounter = () => {
    if (runningRef.current) return
    runningRef.current = setInterval(() => {
      setCounter((prev) => prev + 1)
      if (counterRef.current >= 15) {
        dispatch(nextStep(cell.serialize()))
        stopCounter()
      }
    }, 50)
  }
  const stopCounter = () => {
    if (runningRef.current) {
      clearInterval(runningRef.current)
      runningRef.current = null
      setCounter(0)
    }
  }

  // make sure the counter is stopped when the component is unmounted
  useEffect(() => {
    return () => stopCounter()
  }, [])

  // only add triggers to a cell that has something hidden
  const triggers =
    cell.isFieldHidden || cell.isCropHidden
      ? {
          onMouseDown: startCounter,
          onMouseUp: stopCounter,
          onTouchStart: startCounter,
          onTouchEnd: stopCounter,
          onTouchCancel: stopCounter,
          onTouchMove: stopCounter,
        }
      : {}

  const hiddenField = (
    <button
      {...triggers}
      className={counter > 0 ? "activeEmpty" : "inactive"}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid rgba(0, 0, 0, 0.4)",
        backgroundColor: "rgba(100, 100, 100, 0.3)",
      }}
    ></button>
  )

  const cropDisk = cell.isCropHidden ? (
    <></>
  ) : (
    <div
      className={counter > 0 ? "active" : "inactive"}
      style={{
        width: "90%",
        height: "90%",
        backgroundImage: `url(${getCropImage(cell.crop)})`,
        backgroundSize: "cover",
      }}
    ></div>
  )

  const revealedField = (
    <button
      {...triggers}
      className={counter > 0 ? "active" : "inactive"}
      style={{
        width: "100%",
        height: "100%",
        padding: "0px",
        border: "0px",
        backgroundColor: "rgba(0, 0, 0, 0.0)",
        backgroundImage: `url(${getFieldImage(cell.field)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cropDisk}
    </button>
  )
  const spinner = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <Spinner animation="border" className={"spinner-animation"}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
  let content
  if (boardUiState === "loading") {
    content = spinner
  } else {
    content = cell.isFieldHidden ? hiddenField : revealedField
  }

  return (
    <div
      style={{
        margin: "2px",
      }}
    >
      {content}
    </div>
  )
}
