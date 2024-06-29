import { Coord } from "../generation/Coord.ts"
import { CoordSet } from "../generation/CoordSet.ts"
import { CopyableCell } from "./Cell.ts"

// noinspection JSValidateJSDoc
/**
 * Utility class to select cells in different zones of a board.
 */
export class BoardZoneSelector<T extends CopyableCell<T>> {
  private _board: ReadonlyArray<ReadonlyArray<T>>

  /**
   * Create a new BoardZoneSelector instance.
   *
   * @param {ReadonlyArray<ReadonlyArray<T>>} board - The board to select cells from.
   */
  constructor(board: ReadonlyArray<ReadonlyArray<T>>) {
    this._board = board
  }

  private _isOnBorder(cell: T): boolean {
    return (
      // cells on the first row
      cell.coordinates.y === 0 ||
      // cells on the last row
      cell.coordinates.y === this._board.length - 1 ||
      // cells on the first column
      cell.coordinates.x === 0 ||
      // cells on the last column
      cell.coordinates.x === this._board[0].length - 1
    )
  }

  /**
   * Get the coordinates of the cells on the border of the board.
   */
  get border(): Coord[] {
    return this._board
      .flat()
      .filter(this._isOnBorder.bind(this))
      .map((cell) => cell.coordinates)
  }

  /**
   * Get the coordinates of the cells on the inner ring of the board.
   */
  get innerRing(): Coord[] {
    return this._board
      .flat()
      .filter((cell) => {
        return (
          !this._isOnBorder(cell) &&
          (cell.coordinates.y === 1 || // cells on the second row
            cell.coordinates.y === this._board.length - 2 || // cells on the second to last row
            cell.coordinates.x === 1 || // cells on the second column
            cell.coordinates.x === this._board[0].length - 2) // cells on the second to last column
        )
      })
      .map((cell) => cell.coordinates)
  }

  /**
   * Get the coordinates of the cells in the core of the board.
   */
  get core(): Coord[] {
    return this._board
      .flat()
      .filter((cell) => {
        return (
          // cells after the second row
          cell.coordinates.y > 1 &&
          // cells before the second to last row
          cell.coordinates.y < this._board.length - 2 &&
          // cells after the second column
          cell.coordinates.x > 1 &&
          // cells before the second to last column
          cell.coordinates.x < this._board[0].length - 2
        )
      })
      .map((cell) => cell.coordinates)
  }
}

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
