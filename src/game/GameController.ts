import { Coord } from "./Coord.ts"
import { CoordSet } from "./CoordSet.ts"
import { Crop } from "./enums.ts"
import { SerializedBoard, State } from "./State.ts"
import { StateStack } from "./StateStack.ts"

export class GameConfig {
  // TODO document these
  constructor(
    public readonly boardWidth: number,
    public readonly boardHeight: number,
    public readonly stepMaxTries: number,
    public readonly minGroups: number,
    public readonly maxGroups: number,
  ) {}
}

export class GameController {
  // TODO explain how states are stored
  private stateStack: StateStack

  constructor(private readonly config: GameConfig) {
    this.stateStack = new StateStack(config.stepMaxTries)
  }

  private seedOnes(): State {
    // It's always possible to find a valid configuration, so keep trying until we find one
    for (;;) {
      // clean slate for the state
      let state = State.Empty(this.config.boardWidth, this.config.boardHeight)
      // this shuffled coordinates will provide the randomness throughout the process
      let validCoords = state.getBoardCoordinates().copyShuffled()

      // while there are still valid coordinates
      while (validCoords.size > 0) {
        // get the first valid coordinate
        const coord: Coord = validCoords.values().next().value
        // add it to the state
        state = state.copyWithCell(
          state
            .getCell(coord.x, coord.y)
            .copyWith({ crop: Crop.one, groupId: state.groups.size }),
        )
        // subtract the coord and its neighbors from the valid coords
        validCoords = validCoords.difference(
          new CoordSet(
            coord
              .getNeighbors(this.config.boardHeight, this.config.boardWidth)
              .concat([coord]),
          ),
        )
      }
      // if the group number is within the bounds, return the state
      if (
        state.groups.size >= this.config.minGroups &&
        state.groups.size <= this.config.maxGroups
      )
        return state
    }
  }

  public generateBoard(): SerializedBoard {
    // star by seeding the board with ones
    throw new Error("Not implemented")
    this.stateStack.pushValid(this.seedOnes())
  }
}
