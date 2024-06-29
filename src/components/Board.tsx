import { useAppSelector } from "../app/hooks.ts"
import { selectBoardSize, selectGeneratingBoard } from "../game/gameSlice.ts"
import BoardLoaded from "./BoardLoaded.tsx"
import { BoardLoader } from "./BoardLoader.tsx"

export default function Board() {
  const size = useAppSelector(selectBoardSize)
  const loading = useAppSelector(selectGeneratingBoard)

  if (size) {
    const gameBoard = loading ? (
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
  } else {
    return <></>
  }
}
