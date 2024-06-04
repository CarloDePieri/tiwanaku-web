export type BoardSize = "small" | "standard"

export enum Field {
  forest = "forest",
  desert = "desert",
  mountain = "mountain",
  valley = "valley",
}

export enum Crop {
  one = 1,
  two = 2,
  three = 3,
  four = 4,
  five = 5,
}

/**
 * Class representing a coordinate.
 */
export class Coord {
  readonly x: number
  readonly y: number

  /**
   * Create a coordinate.
   *
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   */
  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  /**
   * Check if this coordinate is equal to another.
   *
   * @param {Coord} coord - The other coordinate to compare with.
   * @return {boolean} True if the coordinates are equal, false otherwise.
   */
  equals(coord: Coord): boolean {
    return this.x === coord.x && this.y === coord.y
  }

  /**
   * Check if this coordinate is a (either orthogonally and diagonally) neighbor of another.
   *
   * @param {Coord} coord - The other coordinate to compare with.
   * @return {boolean} True if the coordinates are neighbors, false otherwise.
   */
  public isNeighborOf(coord: Coord): boolean {
    const dx = Math.abs(this.x - coord.x)
    const dy = Math.abs(this.y - coord.y)
    const isFarAway = dx > 1 || dy > 1
    const isSelf = dx == 0 && dy == 0
    return !isFarAway && !isSelf
  }

  /**
   * Check if this coordinate is an orthogonally neighbor of another.
   *
   * @param {Coord} coord - The other coordinate to compare with.
   * @return {boolean} True if the coordinates are orthogonally neighbors, false otherwise.
   */
  public isOrthogonallyNeighborOf(coord: Coord): boolean {
    const dx = Math.abs(this.x - coord.x)
    const dy = Math.abs(this.y - coord.y)
    const aboveOrBelow = dx == 0 && dy == 1
    const leftOrRight = dx == 1 && dy == 0
    return aboveOrBelow || leftOrRight
  }

  getOrthogonalNeighbors(boardHeight: number, boardWidth: number): Coord[] {
    return [
      new Coord(this.x - 1, this.y),
      new Coord(this.x + 1, this.y),
      new Coord(this.x, this.y - 1),
      new Coord(this.x, this.y + 1),
    ].filter(
      ({ y, x }) => x >= 0 && x < boardWidth && y >= 0 && y < boardHeight,
    )
  }

  getNeighbors(board: Board): Coord[] {
    return board
      .getBoardCoordinates()
      .filter((coord) => this.isNeighborOf(coord))
  }
}

/**
 * Class representing a set of coordinates built on top of an array.
 * It uses .equals to check if a coordinate is actually in the set.
 *
 * TODO find a way to make this more efficient, maybe an Hashtable or a Set that actually works with .equals
 */
export class CoordSet extends Array<Coord> {
  /**
   * Add a coordinate to the set.
   *
   * @param {Coord} coord - The coordinate to add.
   */
  add(coord: Coord): void {
    if (!this.has(coord)) this.push(coord)
  }

  /**
   * Check if a coordinate is in the set.
   *
   * @param {Coord} coord - The coordinate to check.
   * @return {boolean} True if the coordinate is in the set, false otherwise.
   */
  has(coord: Coord): boolean {
    return this.some((c) => c.equals(coord))
  }

  difference(other: CoordSet): CoordSet {
    return this.filter((x: Coord) => !other.has(x)) as CoordSet
  }
}

/**
 * Class representing a group of coordinates.
 */
export class Group {
  /**
   * The coordinates that make up the group.
   */
  readonly coords: Coord[]
  /**
   * The field of the group.
   */
  readonly field: Field | undefined

  /**
   * Create a group.
   * @param {Coord[]} coords - The coordinates that make up the group.
   * @param {Field} field - The kind of field assigned to this group
   */
  constructor(coords: Coord[], field: Field | undefined) {
    this.coords = coords
    this.field = field
  }

  /**
   * Add the coordinate to a new Group object.
   * @return {Group} The group with the new coordinate.
   */
  public getUpdatedGroup(coord: Coord): Group {
    return new Group([...this.coords, coord], this.field)
  }

  public getBorderSet(boardHeight: number, boardWidth: number): CoordSet {
    const set = new CoordSet()
    this.coords
      .flatMap((coord) => coord.getOrthogonalNeighbors(boardHeight, boardWidth))
      .forEach((coord) => set.add(coord))
    return set
  }
}

export type Cell = Readonly<{
  groupId: number | undefined
  coordinates: Coord
  field: Field | undefined
  crop: Crop | undefined
}>

/**
 * A serialized version of a Board object.
 */
export type SerializedBoard = {
  board: {
    field: "mountain" | "valley" | "forest" | "desert" | undefined
    crop: 1 | 2 | 3 | 4 | 5 | undefined
    coordinates: {
      x: number
      y: number
    }
    groupId: number | undefined
  }[][]
}

/**
 * Class representing a game board. The underlying structure is immutable.
 */
export class Board {
  private readonly board: Readonly<Cell[][]>

  /**
   * Create a game board.
   *
   * @param {Cell[][]} board - The initial state of the board.
   */
  constructor(board: Cell[][]) {
    this.board = board
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
            .map((_, j) => ({
              groupId: undefined,
              coordinates: new Coord(j, i),
              field: undefined,
              crop: undefined,
            })),
        ),
    )
  }

  /**
   * Create a new Board instance from a serialized form.
   * This method is useful for restoring the state of the board from a stored or transmitted serialized form.
   *
   * @param {SerializedBoard} serializedBoard - The serialized form of the board.
   * @return {Board} The new Board instance.
   */
  public static deserialize(serializedBoard: SerializedBoard): Board {
    const board = serializedBoard.board.map((row) =>
      row.map((cell) => ({
        groupId: cell.groupId,
        coordinates: new Coord(cell.coordinates.x, cell.coordinates.y),
        field: cell.field ? (cell.field as Field) : undefined,
        crop: cell.crop ? (cell.crop as Crop) : undefined,
      })),
    )
    return new Board(board)
  }

  /**
   * Convert the current state of the board into a serialized form.
   * The serialized form is an object that can be easily converted into a JSON string.
   * This method is useful for storing the state of the board or transmitting it over different threads.
   *
   * @return {SerializedBoard} The serialized form of the board.
   */
  public serialize(): SerializedBoard {
    return {
      board: this.board.map((row) =>
        row.map((cell) => ({
          groupId: cell.groupId,
          coordinates: {
            x: cell.coordinates.x,
            y: cell.coordinates.y,
          },
          field: cell.field
            ? (cell.field as "mountain" | "valley" | "forest" | "desert")
            : undefined,
          crop: cell.crop ? (cell.crop as 1 | 2 | 3 | 4 | 5) : undefined,
        })),
      ),
    }
  }

  /**
   * Get the height of the board.
   *
   * @return {number} The height of the board.
   */
  public get height(): number {
    return this.board.length
  }

  /**
   * Get the width of the board.
   *
   * @return {number} The width of the board.
   */
  public get width(): number {
    return this.board[0]?.length ?? 0
  }

  /**
   * Get the current state of the board.
   *
   * @return {Readonly<Cell[][]>} The current state of the board.
   */
  public getBoard(): Readonly<Cell[][]> {
    return this.board
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
   * Get a new board with an updated cell.
   *
   * @param {Cell} cellToUpdate - The cell that will be updated in the new board.
   * @return {Board} The new board with the updated cell.
   */
  public getUpdatedBoard(cellToUpdate: Cell): Board {
    return new Board([
      ...this.board.map((row) =>
        row.map((s) =>
          s.coordinates.x === cellToUpdate.coordinates.x &&
          s.coordinates.y === cellToUpdate.coordinates.y
            ? cellToUpdate
            : s,
        ),
      ),
    ])
  }

  /**
   * Get all the coordinates of the cells in the board.
   *
   * @return {Coord[]} An array of all the coordinates of the cells in the board.
   */
  public getBoardCoordinates(): Coord[] {
    return this.board.flat().map((cell) => cell.coordinates)
  }
}

/**
 * Class representing the state of the game.
 */
export class State {
  private readonly _board: Board
  private readonly _groups: ReadonlyMap<number, Group>

  /**
   * Create a game state.
   *
   * @param {Board} board - The current state of the game board.
   * @param {ReadonlyMap<number, Group>} groups - The current state of the groups.
   */
  constructor(board: Board, groups: ReadonlyMap<number, Group>) {
    this._board = board
    this._groups = groups
  }

  /**
   * Get the current state of the game board.
   *
   * @return {Board} The current state of the game board.
   */
  public get board(): Board {
    return this._board
  }

  /**
   * Get the current state of the groups.
   *
   * @return {ReadonlyMap<number, Group>} The current state of the groups.
   */
  public get groups(): ReadonlyMap<number, Group> {
    return this._groups
  }

  /**
   * Get a new state with an updated cell.
   *
   * @param {Cell} cellToUpdate - The cell that will be updated in the new state.
   * @return {State} The new state with the updated cell.
   */
  public getUpdatedState(cellToUpdate: Cell): State {
    return new State(
      this._board.getUpdatedBoard(cellToUpdate),
      this.getUpdatedGroups(cellToUpdate),
    )
  }

  /**
   * Get a new groups map with an updated group.
   *
   * @param {Cell} cellToUpdate - The cell that will be updated in the new group.
   * @return {ReadonlyMap<number, Group>} The new groups map with the updated group.
   */
  private getUpdatedGroups(cellToUpdate: Cell): ReadonlyMap<number, Group> {
    const groupId = cellToUpdate.groupId
    const coord = cellToUpdate.coordinates

    // If the group id of the cell is not defined, return the groups as they are
    if (groupId === undefined) return this._groups

    // prepare the updated group
    // BEWARE: if somebody ends up modifying the map directly this is not thread safe
    const oldGroup = this._groups.get(groupId)
    const newGroup =
      oldGroup === undefined
        ? new Group([coord], cellToUpdate.field)
        : oldGroup.getUpdatedGroup(coord)

    // return a new group map with the updated group
    return new Map<number, Group>([...this._groups, [groupId, newGroup]])
  }
}
