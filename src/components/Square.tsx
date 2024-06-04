import sweetPotatoUrl from "../assets/1sweetpotato.png"
import cocaLeafUrl from "../assets/2cocaleaf.png"
import chiliUrl from "../assets/3chili.png"
import cornUrl from "../assets/4corn.png"
import quinoaUrl from "../assets/5quinoa.png"
import desertUrl from "../assets/desert.png"
import forestUrl from "../assets/forest.png"
import mountainUrl from "../assets/mountain.png"
import valleyUrl from "../assets/valley.png"
import { Field, Crop } from "../game/structures.ts"

interface SquareProps {
  field: Field | undefined
  size: Crop | undefined
  width: string
  height: string
  margin: string
}

function getBackgroundImage(field: Field | undefined): string {
  switch (field) {
    case Field.forest:
      return forestUrl
    case Field.desert:
      return desertUrl
    case Field.mountain:
      return mountainUrl
    case Field.valley:
      return valleyUrl
    case undefined:
      return ""
  }
}

function getSizeImage(size: Crop | undefined): string {
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
    case undefined:
      return ""
  }
}

export default function Square({
  field,
  size,
  height,
  width,
  margin,
}: Readonly<SquareProps>) {
  return (
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
      <div
        style={{
          width: "90%",
          height: "90%",
          backgroundImage: `url(${getSizeImage(size)})`,
          backgroundSize: "cover",
        }}
      ></div>
    </div>
  )
}
