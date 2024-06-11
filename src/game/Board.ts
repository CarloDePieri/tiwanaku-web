import { Cell, SerializedCell } from "./Cell.ts"
import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"

export type BoardSize = "small" | "standard"

/**
 * A serialized version of a Board object.
 */
export type SerializedBoard = SerializedCell[][]

/**
 * Class representing an immutable game board.
 */
export class Board {
  private readonly _board: ReadonlyArray<ReadonlyArray<Cell>>
  private readonly _height: number
  private readonly _width: number

  /**
   * Create a game board.
   *
   * @param {Cell[][]} board - The initial state of the board.
   */
  private constructor(board: Cell[][]) {
    this._board = board
    this._height = board.length
    this._width = board[0].length
  }

  /**
   * Create a new Board instance from a copy of the given initial state.
   *
   * @param {Cell[][]} initialBoard - The initial state of the board.
   */
  static fromCells(initialBoard: Cell[][]) {
    return new Board(initialBoard.map((row) => row.map((cell) => cell.copy())))
  }

  /**
   * Create an empty game board.
   *
   * @param {number} width - The width of the board.
   * @param {number} height - The height of the board.
   * @return {Board} The new empty board.
   */
  public static Empty(width: number, height: number): Board {
    return new Board(
      Array(height)
        .fill(0)
        .map((_, i) =>
          Array(width)
            .fill(0)
            .map(
              (_, j) =>
                new Cell(
                  undefined,
                  new Coord(j, i),
                  undefined,
                  undefined,
                  true,
                  true,
                ),
            ),
        ),
    )
  }

  /**
   * Get the current state of the board.
   *
   * @return {ReadonlyArray<ReadonlyArray<Cell>>} The current state of the board.
   */
  get board(): ReadonlyArray<ReadonlyArray<Cell>> {
    return this._board
  }

  /**
   * Get the height of the board.
   *
   * @return {number} The height of the board.
   */
  get height(): number {
    return this._height
  }

  /**
   * Get the width of the board.
   *
   * @return {number} The width of the board.
   */
  get width(): number {
    return this._width
  }

  /**
   * Get a cell from the board.
   *
   * @param {number} x - The x coordinate of the cell.
   * @param {number} y - The y coordinate of the cell.
   * @return {Cell} The cell at the given coordinates.
   */
  public getCell(x: number, y: number): Cell {
    return this.board[y][x]
  }

  /**
   * Get all the coordinates of the cells in the board.
   *
   * @return {CoordSet} A set of all the coordinates of the cells in the board.
   */
  public getAllCoordinates(): CoordSet {
    return new CoordSet(this.board.flat().map((cell) => cell.coordinates))
  }

  /**
   * Convert the current state of the board into a serialized form.
   *
   * @return {SerializedBoard} The serialized form of the board.
   */
  public serialize(): SerializedBoard {
    return this.board.map((row) => row.map((cell) => cell.serialize()))
  }

  /**
   * Create a new Board instance from a serialized form.
   *
   * @param {SerializedBoard} serializedBoard - The serialized form of the board.
   * @return {Board} The new Board instance.
   */
  public static deserialize(serializedBoard: SerializedBoard): Board {
    return new Board(
      serializedBoard.map((row) => row.map((cell) => Cell.deserialize(cell))),
    )
  }

  public get hash(): string {
    return JSON.stringify(this.serialize())
  }

  /**
   * Create a copy of the board with an updated cell.
   *
   * @param {Cell} cell - The updated cell.
   * @return {Board} The copy of the board with the updated cell.
   */
  public copyWithCell(cell: Cell): Board {
    return new Board(
      this._board.map((row) =>
        row.map((c) =>
          c.coordinates.equals(cell.coordinates) ? cell.copy() : c.copy(),
        ),
      ),
    )
  }
}
