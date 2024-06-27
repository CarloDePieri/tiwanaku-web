import { Coord } from "../generation/Coord.ts"
import { Crop, Field } from "./enums.ts"

export interface Cell {
  groupId: number | undefined
  coordinates: Coord
  field: Field | undefined
  crop: Crop | undefined
}

export interface Copyable<T extends Cell> {
  copy(): T
}

export interface CopyableCell<T extends Cell> extends Cell, Copyable<T> {}
