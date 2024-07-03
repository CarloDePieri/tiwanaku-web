import { CoordSet } from "../generation/CoordSet.ts"
import { BaseBoard } from "./BaseBoard.ts"
import { Field } from "./enums.ts"
import { GameCell, SerializedCell } from "./GameCell.ts"
import { State } from "../generation/State.ts"

export type BoardSize = "small" | "standard"

/**
 * A counter for the number of hidden fields of each type.
 */
export type HiddenFieldsCounter = {
  [key in Field]: number
}

/**
 * A serialized version of a game board.
 */
export interface SerializedBoard {
  board: SerializedCell[][]
  hiddenFields: HiddenFieldsCounter
}

/**
 * Class representing a game board meant to be used by the React components.
 * The board contained is supposed to be valid and complete.
 *
 * @extends {BaseBoard<GameCell>}
 */
export class GameBoard extends BaseBoard<GameCell, GameBoard> {
  private readonly _undiscoveredFieldsCounter: HiddenFieldsCounter

  // Private constructor to prevent external instantiation.
  private constructor(
    board: GameCell[][],
    undiscoveredFields: HiddenFieldsCounter,
  ) {
    super(board)
    this._undiscoveredFieldsCounter = undiscoveredFields
  }

  /**
   * Get the number of hidden fields of each type.
   *
   * @return {HiddenFieldsCounter} The number of hidden fields of each type.
   */
  public get undiscoveredFields(): HiddenFieldsCounter {
    return this._undiscoveredFieldsCounter
  }

  /**
   * Create a new GameState instance from a complete State instance.
   * All cells in the provided state must be complete, with no undefined.
   *
   * @param {State} state - The complete State instance.
   * @param {CoordSet} hints - The set of coordinates that are hints.
   * @return {GameBoard} The new GameBoard instance.
   */
  public static fromCompleteState(state: State, hints: CoordSet): GameBoard {
    return new GameBoard(
      // build a GameCell matrix
      state.board.map((row) =>
        row.map((cell) =>
          hints.has(cell.coordinates)
            ? GameCell.fromCompleteCell(cell, false, false)
            : GameCell.fromCompleteCell(cell),
        ),
      ),
      // count the number of undiscovered fields
      state.board.flat().reduce(
        (counter, cell) => {
          counter[cell.field!]++
          return counter
        },
        {
          [Field.desert]: 0,
          [Field.forest]: 0,
          [Field.mountain]: 0,
          [Field.valley]: 0,
        } as HiddenFieldsCounter,
      ),
    )
  }

  /**
   * Serialize this board into a JSON-serializable form.
   *
   * @return {SerializedBoard} The serialized form of the board.
   */
  public getSerializedBoard(): SerializedBoard {
    return {
      board: this.board.map((row) => row.map((cell) => cell.serialize())),
      hiddenFields: this._undiscoveredFieldsCounter,
    }
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
      serializedBoard.board.map((row) =>
        row.map((cell) => GameCell.deserialize(cell)),
      ),
      serializedBoard.hiddenFields,
    )
  }

  /**
   * Get a copy of this board but with a cell replaced.
   *
   * @param {GameCell} cell - The cell to replace.
   * @return {GameBoard} The new board instance with the cell replaced.
   */
  copyWithCell(cell: GameCell): GameBoard {
    const oldCell = this.getCell(cell.coordinates.x, cell.coordinates.y)
    const undiscoveredFields = { ...this._undiscoveredFieldsCounter }
    if (oldCell.isFieldHidden && !cell.isFieldHidden) {
      undiscoveredFields[oldCell.field]--
    } else if (!oldCell.isFieldHidden && cell.isFieldHidden) {
      undiscoveredFields[oldCell.field]++
    }
    return new GameBoard(this._copyCellMatrixWithCell(cell), undiscoveredFields)
  }
}
