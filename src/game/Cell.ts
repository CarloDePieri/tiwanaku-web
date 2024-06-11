import { Coord, SerializedCoord } from "./Coord.ts"
import { Crop, Field } from "./enums.ts"

/**
 * The serialized version of a Cell object.
 */
export type SerializedCell = {
  field: "mountain" | "valley" | "forest" | "desert" | undefined
  crop: 1 | 2 | 3 | 4 | 5 | undefined
  coordinates: SerializedCoord
  groupId: number | undefined
  hiddenField: boolean
  hiddenCrop: boolean
}

/**
 * An immutable cell on the game board.
 */
export class Cell {
  private readonly _groupId: number | undefined
  private readonly _coordinates: Coord
  private readonly _field: Field | undefined
  private readonly _crop: Crop | undefined
  private readonly _hiddenField: boolean
  private readonly _hiddenCrop: boolean

  /**
   * Create a cell.
   *
   * @param {number | undefined} groupId - The group ID of the cell.
   * @param {Coord} coordinates - The coordinates of the cell.
   * @param {Field | undefined} field - The field of the cell.
   * @param {Crop | undefined} crop - The crop of the cell.
   * @param {boolean} hiddenField - Weather the field is hidden.
   * @param {boolean} hiddenCrop - Weather the crop is hidden.
   */
  constructor(
    groupId: number | undefined,
    coordinates: Coord,
    field: Field | undefined,
    crop: Crop | undefined,
    hiddenField: boolean,
    hiddenCrop: boolean,
  ) {
    this._groupId = groupId
    this._coordinates = coordinates
    this._field = field
    this._crop = crop
    this._hiddenField = hiddenField
    this._hiddenCrop = hiddenCrop
  }

  /**
   * Get the group ID of the cell.
   *
   * @return {number | undefined} The group ID of the cell.
   */
  get groupId(): number | undefined {
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
   * @return {Field | undefined} The field of the cell.
   */
  get field(): Field | undefined {
    return this._field
  }

  /**
   * Get the crop of the cell.
   *
   * @return {Crop | undefined} The crop of the cell.
   */
  get crop(): Crop | undefined {
    return this._crop
  }

  /**
   * Get the hidden field status of the cell.
   *
   * @return {boolean} The hidden field status of the cell.
   */
  get hiddenField(): boolean {
    return this._hiddenField
  }

  /**
   * Get the hidden crop status of the cell.
   *
   * @return {boolean} The hidden crop status of the cell.
   */
  get hiddenCrop(): boolean {
    return this._hiddenCrop
  }

  /**
   * Create a new cell with modified properties.
   *
   * @param {Object} newFields - The properties to modify.
   * @param {number} newFields.groupId - The new group ID. Can be set to undefined.
   * @param {Coord} newFields.coordinates - The new coordinates.
   * @param {Field} newFields.field - The new field. Can be set to undefined.
   * @param {Crop} newFields.crop - The new crop. Can be set to undefined.
   * @param {boolean} newFields.hiddenField - The new hidden field status.
   * @param {boolean} newFields.hiddenCrop - The new hidden crop status.
   * @return {Cell} A new cell with the modified properties.
   */
  public copyWith(newFields: {
    groupId?: number
    coordinates?: Coord
    field?: Field
    crop?: Crop
    hiddenField?: boolean
    hiddenCrop?: boolean
  }): Cell {
    // these can be changed, even to undefined
    const groupId = "groupId" in newFields ? newFields.groupId : this._groupId
    const field = "field" in newFields ? newFields.field : this._field
    const crop = "crop" in newFields ? newFields.crop : this._crop

    // these can be changed but NOT to undefined
    const coordinates =
      "coordinates" in newFields && newFields.coordinates !== undefined
        ? newFields.coordinates
        : this._coordinates
    const hiddenField =
      "hiddenField" in newFields && newFields.hiddenField !== undefined
        ? newFields.hiddenField
        : this._hiddenField
    const hiddenCrop =
      "hiddenCrop" in newFields && newFields.hiddenCrop !== undefined
        ? newFields.hiddenCrop
        : this._hiddenCrop

    return new Cell(groupId, coordinates, field, crop, hiddenField, hiddenCrop)
  }

  /**
   * Create a copy of the cell.
   *
   * @return {Cell} A new cell that is a copy of the current cell.
   */
  public copy(): Cell {
    return this.copyWith({})
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
      field: this._field
        ? (this._field as "mountain" | "valley" | "forest" | "desert")
        : undefined,
      crop: this._crop ? (this._crop as 1 | 2 | 3 | 4 | 5) : undefined,
      hiddenField: this._hiddenField,
      hiddenCrop: this._hiddenCrop,
    }
  }

  /**
   * Create a new Cell instance from a serialized form.
   *
   * @param {SerializedCell} serializedCell - The serialized form of the cell.
   * @return {Cell} The new Cell instance.
   */
  public static deserialize(serializedCell: SerializedCell): Cell {
    return new Cell(
      serializedCell.groupId,
      Coord.deserialize(serializedCell.coordinates),
      serializedCell.field ? (serializedCell.field as Field) : undefined,
      serializedCell.crop ? (serializedCell.crop as Crop) : undefined,
      serializedCell.hiddenField,
      serializedCell.hiddenCrop,
    )
  }
}
