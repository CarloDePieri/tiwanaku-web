export interface Equatable<T> {
  equals(other: T): boolean
}

/**
 * Serialized coordinate.
 */
export type SerializedCoord = {
  x: number
  y: number
}

/**
 * An immutable coordinate on the game board.
 */
export class Coord implements Equatable<Coord> {
  private readonly _x: number
  private readonly _y: number

  /**
   * Create a coordinate.
   *
   * @param {number} x - The x value.
   * @param {number} y - The y value.
   */
  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }

  /**
   * Get the x value.
   */
  public get x(): number {
    return this._x
  }

  /**
   * Get the y value.
   */
  public get y(): number {
    return this._y
  }

  /**
   * Check if this coordinate is equal to another.
   *
   * @param {Coord} coord - The other coordinate to compare with.
   * @return {boolean} True if the coordinates are equal, false otherwise.
   */
  public equals(coord: Coord): boolean {
    return this._x === coord._x && this._y === coord._y
  }

  /**
   * Get the orthogonal neighbors of the coordinate on a game board of specified dimensions.
   *
   * @param {number} boardHeight - The height of the game board.
   * @param {number} boardWidth - The width of the game board.
   * @return {Coord[]} The orthogonal neighbors of the coordinate.
   */
  public getOrthogonalNeighbors(
    boardHeight: number,
    boardWidth: number,
  ): Coord[] {
    return this.filterOutOfBounds(
      [
        new Coord(this._x - 1, this._y),
        new Coord(this._x + 1, this._y),
        new Coord(this._x, this._y - 1),
        new Coord(this._x, this._y + 1),
      ],
      boardHeight,
      boardWidth,
    )
  }

  /**
   * Get the neighbors of the coordinate on a game board of specified dimensions.
   *
   * @param {number} boardHeight - The height of the game board.
   * @param {number} boardWidth - The width of the game board.
   * @return {Coord[]} The neighbors of the coordinate.
   */
  public getNeighbors(boardHeight: number, boardWidth: number): Coord[] {
    // Generate all possible neighboring coordinates
    return this.filterOutOfBounds(
      [
        new Coord(this._x - 1, this._y), // left
        new Coord(this._x + 1, this._y), // right
        new Coord(this._x, this._y - 1), // above
        new Coord(this._x, this._y + 1), // below
        new Coord(this._x - 1, this._y - 1), // top-left
        new Coord(this._x + 1, this._y - 1), // top-right
        new Coord(this._x - 1, this._y + 1), // bottom-left
        new Coord(this._x + 1, this._y + 1), // bottom-right
      ],
      boardHeight,
      boardWidth,
    )
  }

  /**
   * Serialize the coordinate.
   *
   * @return {SerializedCoord} The serialized coordinate.
   */
  public serialize(): SerializedCoord {
    return { x: this._x, y: this._y }
  }

  /**
   * Deserialize the coordinate.
   *
   * @param {SerializedCoord} coord - The serialized coordinate.
   * @return {Coord} The deserialized coordinate.
   */
  public static deserialize(coord: SerializedCoord): Coord {
    return new Coord(coord.x, coord.y)
  }

  // filter out coordinates that are out of the given board
  private filterOutOfBounds(
    neighbors: Coord[],
    boardHeight: number,
    boardWidth: number,
  ): Coord[] {
    return neighbors.filter(
      ({ x, y }) => x >= 0 && x < boardWidth && y >= 0 && y < boardHeight,
    )
  }
}
