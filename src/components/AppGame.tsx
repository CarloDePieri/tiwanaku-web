import { Stack } from "react-bootstrap"
import { useAppSelector } from "../app/hooks.ts"
import { selectBoard, selectBoardTransition } from "../game/gameSlice.ts"
import useWindowDimensions from "./useWindowDimensions.ts"
import { AppBoard } from "./AppBoard.tsx"
import { AppFields } from "./AppFields.tsx"
import { areHintsOnTheSide } from "./areHintsOnTheSide.ts"

export default function AppGame() {
  const boardTransition = useAppSelector(selectBoardTransition)
  const board = useAppSelector(selectBoard)
  const dim = useWindowDimensions()

  if (board) {
    const screenSizeRatio = dim.width / dim.height
    const hintsOnTheSide = areHintsOnTheSide(dim)
    const hintsSize = 15

    const appFields = (
      <AppFields
        height={hintsOnTheSide ? 80 : hintsSize}
        width={hintsOnTheSide ? hintsSize : 100}
        board={board}
      />
    )
    const appBoard = (
      <AppBoard
        height={hintsOnTheSide ? 100 : 100 - hintsSize}
        width={hintsOnTheSide ? 100 - hintsSize : 100}
        board={board}
      />
    )

    return (
      <Stack
        className={boardTransition ? "fadeOut" : "fadeIn"}
        direction={hintsOnTheSide ? "horizontal" : "vertical"}
        style={{
          height: screenSizeRatio > 1 ? `90vh` : `70vh`,
        }}
      >
        {hintsOnTheSide ? (
          <>
            {appFields}
            {appBoard}
          </>
        ) : (
          <>
            {appBoard}
            {appFields}
          </>
        )}
      </Stack>
    )
  } else {
    return <></>
  }
}
