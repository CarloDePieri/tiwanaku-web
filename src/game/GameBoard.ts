import { BaseBoard } from "./BaseBoard.ts"
import { GameCell, SerializedCell } from "./GameCell.ts"
import { State } from "../generation/State.ts"

export type BoardSize = "small" | "standard"

/**
 * A serialized version of a game board.
 */
export type SerializedBoard = SerializedCell[][]

/**
 * Class representing a game board meant to be used by the React components.
 * The board contained is supposed to be valid and complete.
 *
 * @extends {BaseBoard<GameCell>}
 */
export class GameBoard extends BaseBoard<GameCell, GameBoard> {
  private constructor(board: GameCell[][]) {
    super(board)
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

  copyWithCell(cell: GameCell): GameBoard {
    return new GameBoard(this._copyCellMatrixWithCell(cell))
  }
}
