import { Coord } from "./Coord.ts"
import { ImmutableEquatableSet } from "./ImmutableEquatableSet.ts"
import { Field } from "./enums.ts"

/**
 * Represents a group of Coordinates on a game board with the same field type.
 */
export class Group extends ImmutableEquatableSet<Coord> {
  private readonly _field: Field | undefined
  private readonly _id: number | undefined

  /**
   * Constructs a new Group.
   *
   * @param {Iterable<Coord>} initialValues - An iterable of initial coordinates for the group.
   * @param {Field} field - The field associated with the group.
   * @param {number} groupId - The ID associated with the group.
   */
  constructor(
    initialValues?: Iterable<Coord>,
    field?: Field,
    groupId?: number,
  ) {
    super(initialValues)
    this._field = field
    this._id = groupId
  }

  /**
   * Returns a new Group with the given coordinate added.
   *
   * @param {Coord} coord - The coordinate to add.
   * @return {Group} A new Group with the added coordinate.
   */
  public add(coord: Coord): Group {
    return new Group(super.add(coord), this._field)
  }

  /**
   * Gets the field associated with the group.
   *
   * @return {Field | undefined} The field associated with the group, or undefined if no field is associated.
   */
  get field(): Field | undefined {
    return this._field
  }

  /**
   * Gets the ID associated with the group.
   *
   * @return {number | undefined} The ID associated with the group, or undefined if no ID is associated.
   */
  get groupId(): number | undefined {
    return this._id
  }

  /**
   * Creates a copy of the group with modified properties.
   *
   * @param {Object} newFields - The properties to modify.
   * @param {Field} newFields.field - The new field. Can be set to undefined.
   * @param {number} newFields.groupId - The new group ID. Can be set to undefined.
   * @return {Group} A new Group that is a copy of the current group, but with the modified properties.
   */
  public copyWith(newFields: { field?: Field; groupId?: number }): Group {
    // these can be changed, even to undefined
    const groupId = "groupId" in newFields ? newFields.groupId : this._id
    const field = "field" in newFields ? newFields.field : this._field
    return new Group(this, field, groupId)
  }

  /**
   * Gets the orthogonal neighbors of the group on a game board of specified dimensions.
   *
   * @param {number} boardHeight - The height of the game board.
   * @param {number} boardWidth - The width of the game board.
   * @return {ImmutableEquatableSet<Coord>} A set of coordinates representing the orthogonal neighbors of the group.
   */
  public getOrthogonalNeighbors(
    boardHeight: number,
    boardWidth: number,
  ): ImmutableEquatableSet<Coord> {
    return this.flatMap(
      (coord) =>
        new ImmutableEquatableSet<Coord>(
          coord.getOrthogonalNeighbors(boardHeight, boardWidth),
        ),
    ).difference(this)
  }
}
