import sweetPotatoUrl from "../assets/crop_1sweetpotato.png"
import cocaLeafUrl from "../assets/crop_2cocaleaf.png"
import chiliUrl from "../assets/crop_3chili.png"
import cornUrl from "../assets/crop_4corn.png"
import quinoaUrl from "../assets/crop_5quinoa.png"
import desertUrl from "../assets/field_desert.png"
import forestUrl from "../assets/field_forest.png"
import mountainUrl from "../assets/field_mountain.png"
import valleyUrl from "../assets/field_valley.png"
import { Crop, Field } from "../game/enums.ts"

export function getFieldImage(field: Field): string {
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

export function getCropImage(size: Crop): string {
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
