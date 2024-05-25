import sweetPotatoUrl from "../assets/1sweetpotato.png"
import cocaLeafUrl from "../assets/2cocaleaf.png"
import chiliUrl from "../assets/3chili.png"
import cornUrl from "../assets/4corn.png"
import quinoaUrl from "../assets/5quinoa.png"
import desertUrl from "../assets/desert.png"
import forestUrl from "../assets/forest.png"
import mountainUrl from "../assets/mountain.png"
import valleyUrl from "../assets/valley.png"
import { Field, Size } from "../game/structures.ts"

interface SquareProps {
  field: Field | undefined
  size: Size | undefined
  groupId: number | undefined
}

function getBackgroundImage(field: Field | undefined): string {
  switch (field) {
    case Field.Forest:
      return forestUrl
    case Field.Desert:
      return desertUrl
    case Field.Mountain:
      return mountainUrl
    case Field.Valley:
      return valleyUrl
    case undefined:
      return ""
  }
}

function getSizeImage(size: Size | undefined): string {
  switch (size) {
    case Size.One:
      return sweetPotatoUrl
    case Size.Two:
      return cocaLeafUrl
    case Size.Three:
      return chiliUrl
    case Size.Four:
      return cornUrl
    case Size.Five:
      return quinoaUrl
    case undefined:
      return ""
  }
}

export default function Square({
  field,
  size,
  groupId,
}: Readonly<SquareProps>) {
  return (
    <div
      style={{
        width: "18vw",
        height: "18vw",
        border: "1px solid #dcdcdc",
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
      >
        {groupId ?? ""}
      </div>
    </div>
  )
}
