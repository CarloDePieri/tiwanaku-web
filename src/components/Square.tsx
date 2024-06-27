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

  const cropDisk = cell.isCropHidden ? (
    <></>
  ) : (
    <div
      style={{
        width: "90%",
        height: "90%",
        backgroundImage: `url(${getSizeImage(size)})`,
        backgroundSize: "cover",
      }}
    ></div>
  )

  const fieldSquare = cell.isFieldHidden ? (
    <div
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
    ></div>
  ) : (
    <div
      style={{
        width: width,
        height: height,
        margin: margin,
        backgroundImage: `url(${getBackgroundImage(field)})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {cropDisk}
    </div>
  )

  return fieldSquare
}
