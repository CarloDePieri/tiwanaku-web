import { useEffect, useRef, useState } from "react"
import { useAppDispatch } from "../app/hooks.ts"
import sweetPotatoUrl from "../assets/1sweetpotato.png"
import cocaLeafUrl from "../assets/2cocaleaf.png"
import chiliUrl from "../assets/3chili.png"
import cornUrl from "../assets/4corn.png"
import quinoaUrl from "../assets/5quinoa.png"
import desertUrl from "../assets/desert.png"
import forestUrl from "../assets/forest.png"
import mountainUrl from "../assets/mountain.png"
import valleyUrl from "../assets/valley.png"
import { Field, Crop } from "../game/enums.ts"
import { GameCell } from "../game/GameCell.ts"
import "./Square.css"
import { nextStep } from "../game/gameSlice.ts"

interface SquareProps {
  cell: GameCell
  width: string
  height: string
  margin: string
}

function getBackgroundImage(field: Field): string {
  switch (field) {
    case Field.forest:
      return forestUrl
    case Field.desert:
      return desertUrl
    case Field.mountain:
      return mountainUrl
    case Field.valley:
      return valleyUrl
  }
}

function getSizeImage(size: Crop): string {
  switch (size) {
    case Crop.one:
      return sweetPotatoUrl
    case Crop.two:
      return cocaLeafUrl
    case Crop.three:
      return chiliUrl
    case Crop.four:
      return cornUrl
    case Crop.five:
      return quinoaUrl
  }
}

export default function Square({
  cell,
  height,
  width,
  margin,
}: Readonly<SquareProps>) {
  const field = cell.field
  const size = cell.crop
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
      if (counterRef.current >= 10) {
        dispatch(nextStep(cell.serialize()))
        stopCounter()
      }
    }, 100)
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

  const cropDisk = cell.isCropHidden ? (
    <></>
  ) : (
    <div
      className={counter > 0 ? "active" : "inactive"}
      style={{
        width: "90%",
        height: "90%",
        backgroundImage: `url(${getSizeImage(size)})`,
        backgroundSize: "cover",
      }}
    ></div>
  )

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

  return cell.isFieldHidden ? (
    <button
      {...triggers}
      className={counter > 0 ? "activeEmpty" : "inactive"}
      style={{
        width: width,
        height: height,
        margin: margin,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "2px solid rgba(0, 0, 0, 0.4)",
        backgroundColor: "rgba(100, 100, 100, 0.3)",
      }}
    ></button>
  ) : (
    <button
      {...triggers}
      className={counter > 0 ? "active" : "inactive"}
      style={{
        width: width,
        height: height,
        margin: margin,
        padding: "0px",
        border: "0px",
        backgroundColor: "rgba(0, 0, 0, 0.0)",
        backgroundImage: `url(${getBackgroundImage(field)})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cropDisk}
    </button>
  )
}
