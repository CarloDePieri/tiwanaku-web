import "./App.css"
import { useEffect } from "react"
import { Stack } from "react-bootstrap"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import { useAppDispatch, useAppSelector } from "./app/hooks.ts"
import Board from "./components/Board.tsx"
import { Controls } from "./components/Controls.tsx"
import { Fields } from "./components/Fields.tsx"
import { Hints } from "./components/Hints.tsx"
import {
  generateNewBoard,
  selectBoardTransition,
  selectBoardUiState,
  selectCachedSmallBoards,
  selectCachedStandardBoards,
  selectGeneratingBoard,
} from "./game/gameSlice.ts"

function App() {
  const handle = useFullScreenHandle()
  const dispatch = useAppDispatch()
  const cachedSmallBoards = useAppSelector(selectCachedSmallBoards)
  const cachedStandardBoards = useAppSelector(selectCachedStandardBoards)
  const generatingStandardBoard = useAppSelector(
    selectGeneratingBoard("standard"),
  )
  const generatingSmallBoard = useAppSelector(selectGeneratingBoard("small"))
  const boardTransition = useAppSelector(selectBoardTransition)
  const boardUiState = useAppSelector(selectBoardUiState)

  // How many cached boards to keep, per size
  const cacheSize = 4

  // These keep cached boards so that the user can request a new one without delay
  useEffect(() => {
    if (cachedStandardBoards.length < cacheSize && !generatingStandardBoard) {
      dispatch(generateNewBoard("standard"))
    }
  }, [cachedStandardBoards])
  useEffect(() => {
    if (cachedSmallBoards.length < cacheSize && !generatingSmallBoard) {
      dispatch(generateNewBoard("small"))
    }
  }, [cachedSmallBoards])

  return (
    <FullScreen className={"fullscreenStyle"} handle={handle}>
      <Stack gap={3} style={{ marginTop: "10pt", marginBottom: "20pt" }}>
        <div className={boardTransition ? "fadeOut" : "fadeIn"}>
          <Board />
          {boardUiState === "loaded" && (
            <>
              <Hints />
              <Fields />
            </>
          )}
        </div>
        <Controls handle={handle} />
      </Stack>
    </FullScreen>
  )
}

export default App
