import { useAppSelector } from "../app/hooks.ts"
import {
  selectBoard,
  selectBoardSize,
  selectBoardUiState,
} from "../game/gameSlice.ts"
import BoardLoaded from "./BoardLoaded.tsx"
import { BoardLoader } from "./BoardLoader.tsx"

export default function Board() {
  const size = useAppSelector(selectBoardSize)
  const board = useAppSelector(selectBoard)
  const boardUiState = useAppSelector(selectBoardUiState)

  if (boardUiState === "empty" || !size || !board) {
    return <></>
  } else {
    const gameBoard =
      boardUiState === "loading" ? (
        <BoardLoader
          size={size}
          cellMargin={0.5}
          maxVH={95}
          maxVW={95}
          targetVW={95}
          targetVH={95}
        />
      ) : (
        <BoardLoaded
          cellMargin={0.25}
          maxVH={95}
          maxVW={95}
          targetVW={95}
          targetVH={95}
        />
      )

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
        }}
      >
        {gameBoard}
      </div>
    )
  }
}
