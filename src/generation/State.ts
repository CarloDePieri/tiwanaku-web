import { IncompleteCell } from "./Cell.ts"
import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"
import { Group } from "./Group.ts"

/**
 * Class representing the state of game board.
 */
export class State {
  private readonly _board: ReadonlyArray<ReadonlyArray<IncompleteCell>>
  private readonly _boardHeight: number
  private readonly _boardWidth: number
  private readonly _groups: ReadonlyMap<number, Group>

  /**
   * Create a game board state.
   *
   * @param {IncompleteCell[][]} board - The actual board.
   * @param {ReadonlyMap<number, Group>} groups - The groups present on the board.
   */
  private constructor(
    board: IncompleteCell[][],
    groups: ReadonlyMap<number, Group>,
  ) {
    this._board = board
    this._boardHeight = board.length
    this._boardWidth = board[0].length
    this._groups = groups
  }

  /**
   * Create State instance from a copy of the given initial board.
   *
   * @param {IncompleteCell[][]} initialBoard - The initial state of the board to copy.
   */
  static fromBoard(initialBoard: IncompleteCell[][]) {
    const groups: Map<number, Group> = new Map<number, Group>()
    return new State(
      initialBoard.map((row) =>
        row.map((cell) => {
          this.updateGroups(groups, cell)
          return cell.copy()
        }),
      ),
      groups,
    )
  }

  /**
   * Create the state of an empty game board.
   *
   * @param {number} width - The width of the board.
   * @param {number} height - The height of the board.
   * @return {State} The new empty board state.
   */
  public static Empty(width: number, height: number): State {
    return new State(
      Array(height)
        .fill(0)
        .map((_, i) =>
          Array(width)
            .fill(0)
            .map(
              (_, j) =>
                new IncompleteCell(
                  undefined,
                  new Coord(j, i),
                  undefined,
                  undefined,
                ),
            ),
        ),
      new Map<number, Group>(),
    )
  }

  /**
   * Get actual board of the current state.
   *
   * @return {ReadonlyArray<ReadonlyArray<IncompleteCell>>} The current state of the board.
   */
  get board(): ReadonlyArray<ReadonlyArray<IncompleteCell>> {
    return this._board
  }

  /**
   * Get the height of the board.
   *
   * @return {number} The height of the board.
   */
  get boardHeight(): number {
    return this._boardHeight
  }

  /**
   * Get the width of the board.
   *
   * @return {number} The width of the board.
   */
  get boardWidth(): number {
    return this._boardWidth
  }

  /**
   * Get the groups present on the board.
   *
   * @return {ReadonlyMap<number, Group>} The groups present on the board.
   */
  get groups(): ReadonlyMap<number, Group> {
    return this._groups
  }

  /**
   * Get a specific cell from the board.
   *
   * @param {number} x - The x coordinate of the cell.
   * @param {number} y - The y coordinate of the cell.
   * @return {IncompleteCell} The cell at the given coordinates.
   */
  public getCell(x: number, y: number): IncompleteCell {
    return this.board[y][x]
  }

  /**
   * Get all the coordinates of the cells in the board.
   *
   * @return {CoordSet} A set of all the coordinates of the cells in the board.
   */
  public getBoardCoordinates(): CoordSet {
    return CoordSet.from(this.board.flat().map((cell) => cell.coordinates))
  }

  /**
   * Get a hash of the current state of the board.
   *
   * @return {string} The hash of the current state of the board.
   */
  public get hash(): string {
    return JSON.stringify(this._board)
  }

  /**
   * Create a copy of the board state with an updated cell.
   *
   * @param {IncompleteCell} cell - The updated cell.
   * @return {State} The copy of the board state with the updated cell.
   */
  public copyWithCell(cell: IncompleteCell): State {
    return new State(
      this._board.map((row) =>
        row.map((c) =>
          c.coordinates.equals(cell.coordinates) ? cell.copy() : c.copy(),
        ),
      ),
      this.getUpdatedGroups(cell),
    )
  }

  /**
   * Update the given groups map with the given cell. This method mutates the groups map.
   *
   * @param {Map<number, Group>} groups - The groups map to update.
   * @param {IncompleteCell} cell - The cell to update the groups map with.
   */
  private static updateGroups(
    groups: Map<number, Group>,
    cell: IncompleteCell,
  ): void {
    const groupId = cell.groupId
    // if the cell has no groupId yet, simply return the current groups
    if (groupId === undefined) return

    const coord = cell.coordinates

    // check if the group already exists
    const oldGroup = groups.get(groupId)
    // either create a new group or update the existing one
    const group =
      oldGroup === undefined
        ? Group.from([coord], cell.field, groupId)
        : oldGroup.withCoord(coord)

    // update the groups map
    groups.set(groupId, group)
  }

  /**
   * Get an updated copy of the groups with the new cell.
   *
   * @param {IncompleteCell} cell - The new cell.
   * @return {ReadonlyMap<number, Group>} The updated copy of the groups.
   */
  private getUpdatedGroups(cell: IncompleteCell): ReadonlyMap<number, Group> {
    // make a copy of the groups
    const groupCopy = new Map<number, Group>([...this._groups])
    // update the copy with the new cell
    State.updateGroups(groupCopy, cell)
    // return the updated copy
    return groupCopy
  }
}
