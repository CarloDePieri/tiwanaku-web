import { Coord } from "./Coord.ts"
import { Crop, Field } from "./enums.ts"

/**
 * An immutable cell on the game board.
 */
export class IncompleteCell {
  private readonly _groupId: number | undefined
  private readonly _coordinates: Coord
  private readonly _field: Field | undefined
  private readonly _crop: Crop | undefined

  /**
   * Create a cell.
   *
   * @param {number | undefined} groupId - The group ID of the cell.
   * @param {Coord} coordinates - The coordinates of the cell.
   * @param {Field | undefined} field - The field of the cell.
   * @param {Crop | undefined} crop - The crop of the cell.
   */
  constructor(
    groupId: number | undefined,
    coordinates: Coord,
    field: Field | undefined,
    crop: Crop | undefined,
  ) {
    this._groupId = groupId
    this._coordinates = coordinates
    this._field = field
    this._crop = crop
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
   * Create a new cell with modified properties.
   *
   * @param {Object} newFields - The properties to modify.
   * @param {number} newFields.groupId - The new group ID. Can be set to undefined.
   * @param {Coord} newFields.coordinates - The new coordinates.
   * @param {Field} newFields.field - The new field. Can be set to undefined.
   * @param {Crop} newFields.crop - The new crop. Can be set to undefined.
   * @return {IncompleteCell} A new cell with the modified properties.
   */
  public copyWith(newFields: {
    groupId?: number
    coordinates?: Coord
    field?: Field
    crop?: Crop
  }): IncompleteCell {
    // these can be changed, even to undefined
    const groupId = "groupId" in newFields ? newFields.groupId : this._groupId
    const field = "field" in newFields ? newFields.field : this._field
    const crop = "crop" in newFields ? newFields.crop : this._crop

    // this can be changed but NOT to undefined
    const coordinates =
      "coordinates" in newFields && newFields.coordinates !== undefined
        ? newFields.coordinates
        : this._coordinates

    return new IncompleteCell(groupId, coordinates, field, crop)
  }

  /**
   * Create a copy of the cell.
   *
   * @return {IncompleteCell} A new cell that is a copy of the current cell.
   */
  public copy(): IncompleteCell {
    return this.copyWith({})
  }
}
