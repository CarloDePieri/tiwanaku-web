import { GameCell, SerializedCell } from "./GameCell.ts"
import { State } from "../generation/State.ts"

export type BoardSize = "small" | "standard"

/**
 * A serialized version of a game board.
 */
export type SerializedBoard = SerializedCell[][]

export class GameBoard {
  private readonly _board: ReadonlyArray<ReadonlyArray<GameCell>>
  private readonly _boardHeight: number
  private readonly _boardWidth: number

  private constructor(board: GameCell[][]) {
    this._board = board
    this._boardHeight = board.length
    this._boardWidth = board[0].length
  }

  /**
   * Create a new GameState instance from a complete State instance.
   * All cells in the provided state must be complete, with no undefined.
   *
   * @param {State} state - The complete State instance.
   * @return {GameBoard} The new GameBoard instance.
   */
  public static fromCompleteState(state: State): GameBoard {
    return new GameBoard(
      state.board.map((row) =>
        row.map((cell) => GameCell.fromCompleteCell(cell)),
      ),
    )
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
   * Get the current state of the board.
   *
   * @return {ReadonlyArray<ReadonlyArray<GameCell>>} The current state of the board.
   */
  get board(): ReadonlyArray<ReadonlyArray<GameCell>> {
    return this._board
  }

  /**
   * Get a specific cell from the board.
   *
   * @param {number} x - The x coordinate of the cell.
   * @param {number} y - The y coordinate of the cell.
   * @return {GameCell} The cell at the given coordinates.
   */
  public getCell(x: number, y: number): GameCell {
    return this.board[y][x]
  }

  /**
   * Serialize this board into a JSON-serializable form.
   *
   * @return {SerializedBoard} The serialized form of the board.
   */
  public getSerializedBoard(): SerializedBoard {
    return this.board.map((row) => row.map((cell) => cell.serialize()))
  }

  /**
   * Create a new Board instance from a serialized board.
   *
   * @param {SerializedBoard} serializedBoard - The serialized form of the board.
   * @return {GameBoard} The new Board instance.
   */
  public static fromSerializedBoard(
    serializedBoard: SerializedBoard,
  ): GameBoard {
    return new GameBoard(
      serializedBoard.map((row) =>
        row.map((cell) => GameCell.deserialize(cell)),
      ),
    )
  }
}
