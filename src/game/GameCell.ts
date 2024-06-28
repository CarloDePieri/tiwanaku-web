import { IncompleteCell } from "../generation/IncompleteCell.ts"
import { Coord, SerializedCoord } from "../generation/Coord.ts"
import { CopyableCell } from "./Cell.ts"
import { Crop, Field } from "./enums.ts"

/**
 * The serialized version of a Cell object.
 */
export type SerializedCell = {
  field: "mountain" | "valley" | "forest" | "desert"
  crop: 1 | 2 | 3 | 4 | 5
  coordinates: SerializedCoord
  groupId: number
  hiddenField: boolean
  hiddenCrop: boolean
}

export class GameCell implements CopyableCell<GameCell> {
  private readonly _groupId: number
  private readonly _coordinates: Coord
  private readonly _field: Field
  private readonly _crop: Crop
  private readonly _isFieldHidden: boolean
  private readonly _isCropHidden: boolean

  private constructor(
    groupId: number,
    coordinates: Coord,
    field: Field,
    crop: Crop,
    isFieldHidden: boolean,
    isCropHidden: boolean,
  ) {
    this._groupId = groupId
    this._coordinates = coordinates
    this._field = field
    this._crop = crop
    this._isFieldHidden = isFieldHidden
    this._isCropHidden = isCropHidden
  }

  /**
   * Get the group ID of the cell.
   *
   * @return {number} The group ID of the cell.
   */
  get groupId(): number {
    return this._groupId
  }

  /**
   * Get the coordinates of the cell.
   *
   * @return {Coord} The coordinates of the cell.
   */
  get coordinates(): Coord {
    return this._coordinates
  }

  /**
   * Get the field of the cell.
   *
   * @return {Field} The field of the cell.
   */
  get field(): Field {
    return this._field
  }

  /**
   * Get the crop of the cell.
   *
   * @return {Crop} The crop of the cell.
   */
  get crop(): Crop {
    return this._crop
  }

  /**
   * Get the hidden field status of the cell.
   *
   * @return {boolean} The hidden field status of the cell.
   */
  get isFieldHidden(): boolean {
    return this._isFieldHidden
  }

  /**
   * Get the hidden crop status of the cell.
   *
   * @return {boolean} The hidden crop status of the cell.
   */
  get isCropHidden(): boolean {
    return this._isCropHidden
  }

  /**
   * Create a GameCell from a Cell with complete fields, no undefined is allowed.
   *
   * @param {IncompleteCell} cell - The cell to create a GameCell from.
   * @param {boolean} hiddenField - Whether the field should be hidden.
   * @param {boolean} hiddenCrop - Whether the crop should be hidden.
   * @return {GameCell} The GameCell created from the given Cell.
   */
  public static fromCompleteCell(
    cell: IncompleteCell,
    hiddenField: boolean = true,
    hiddenCrop: boolean = true,
  ): GameCell {
    if (
      cell.groupId === undefined ||
      cell.field === undefined ||
      cell.crop === undefined
    ) {
      throw new Error("Cannot create a GameCell from an incomplete Cell")
    }
    return new GameCell(
      cell.groupId,
      cell.coordinates,
      cell.field,
      cell.crop,
      hiddenField,
      hiddenCrop,
    )
  }

  /**
   * Create a copy of the cell but with the field not hidden.
   *
   * @return {GameCell} A new cell with the field discovered.
   */
  public copyAndDiscoverField(): GameCell {
    return new GameCell(
      this._groupId,
      this._coordinates,
      this._field,
      this._crop,
      false,
      this._isCropHidden,
    )
  }

  /**
   * Create a copy of the cell but with the crop not hidden.
   *
   * @return {GameCell} A new cell with the crop discovered.
   */
  public copyAndDiscoverCrop(): GameCell {
    return new GameCell(
      this._groupId,
      this._coordinates,
      this._field,
      this._crop,
      this._isFieldHidden,
      false,
    )
  }

  /**
   * Serialize the cell into a simple object.
   *
   * @return {SerializedCell} The serialized cell.
   */
  public serialize(): SerializedCell {
    return {
      groupId: this._groupId,
      coordinates: this._coordinates.serialize(),
      field: this._field as "mountain" | "valley" | "forest" | "desert",
      crop: this._crop as 1 | 2 | 3 | 4 | 5,
      hiddenField: this._isFieldHidden,
      hiddenCrop: this._isCropHidden,
    }
  }

  /**
   * Create a new Cell instance from a serialized form.
   *
   * @param {SerializedCell} serializedCell - The serialized form of the cell.
   * @return {GameCell} The new Cell instance.
   */
  public static deserialize(serializedCell: SerializedCell): GameCell {
    return new GameCell(
      serializedCell.groupId,
      Coord.deserialize(serializedCell.coordinates),
      serializedCell.field as Field,
      serializedCell.crop as Crop,
      serializedCell.hiddenField,
      serializedCell.hiddenCrop,
    )
  }

  public copy(): GameCell {
    return new GameCell(
      this._groupId,
      this._coordinates,
      this._field,
      this._crop,
      this._isFieldHidden,
      this._isCropHidden,
    )
  }
}
