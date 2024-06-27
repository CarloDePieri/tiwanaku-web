import { CoordSet } from "../generation/CoordSet.ts"
import { CopyableCell } from "./Cell.ts"

// noinspection JSValidateJSDoc
export abstract class BaseBoard<
  T extends CopyableCell<T>,
  Self extends BaseBoard<T, Self>,
> {
  protected readonly _board: ReadonlyArray<ReadonlyArray<T>>
  protected readonly _boardHeight: number
  protected readonly _boardWidth: number

  protected constructor(board: T[][]) {
    this._board = board
    this._boardHeight = board.length
    this._boardWidth = board[0].length
  }

  /**
   * Get actual board of the current state.
   *
   * @return {ReadonlyArray<ReadonlyArray<T>>} The current state of the board.
   */
  get board(): ReadonlyArray<ReadonlyArray<T>> {
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
   * Get a specific cell from the board.
   *
   * @param {number} x - The x coordinate of the cell.
   * @param {number} y - The y coordinate of the cell.
   * @return {T} The cell at the given coordinates.
   */
  getCell(x: number, y: number): T {
    return this.board[y][x]
  }

  /**
   * Get all the coordinates of the cells in the board.
   *
   * @return {CoordSet} A set of all the coordinates of the cells in the board.
   */
  getBoardCoordinates(): CoordSet {
    return CoordSet.from(this.board.flat().map((cell) => cell.coordinates))
  }

  // return a copy of the ._board field with the cell at the given coordinates replaced with the given cell
  protected _copyCellMatrixWithCell(cell: T): T[][] {
    return this._board.map((row) =>
      row.map((c) =>
        c.coordinates.equals(cell.coordinates) ? cell.copy() : c.copy(),
      ),
    )
  }

  abstract copyWithCell(cell: T): Self
}
