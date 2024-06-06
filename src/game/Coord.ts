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
  public equals(coord: Coord): boolean {
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

  public getOrthogonalNeighbors(
    boardHeight: number,
    boardWidth: number,
  ): Coord[] {
    return this.filterOutOfBounds(
      [
        new Coord(this.x - 1, this.y),
        new Coord(this.x + 1, this.y),
        new Coord(this.x, this.y - 1),
        new Coord(this.x, this.y + 1),
      ],
      boardHeight,
      boardWidth,
    )
  }

  public getNeighbors(boardHeight: number, boardWidth: number): Coord[] {
    // Generate all possible neighboring coordinates
    return this.filterOutOfBounds(
      [
        new Coord(this.x - 1, this.y), // left
        new Coord(this.x + 1, this.y), // right
        new Coord(this.x, this.y - 1), // above
        new Coord(this.x, this.y + 1), // below
        new Coord(this.x - 1, this.y - 1), // top-left
        new Coord(this.x + 1, this.y - 1), // top-right
        new Coord(this.x - 1, this.y + 1), // bottom-left
        new Coord(this.x + 1, this.y + 1), // bottom-right
      ],
      boardHeight,
      boardWidth,
    )
  }

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
