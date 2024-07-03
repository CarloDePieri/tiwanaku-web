import "./App.css"
import { useEffect } from "react"
import { Stack } from "react-bootstrap"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import { useAppDispatch, useAppSelector } from "./app/hooks.ts"
import { Controls } from "./components/Controls.tsx"
import AppGame from "./components/AppGame.tsx"
import { Hints } from "./components/Hints.tsx"
import {
  generateNewBoard,
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

  // How many cached boards to keep, per size
  const cacheSize = 4

  // These keep cached boards so that the user can request a new one without delay
  useEffect(() => {
    if (cachedStandardBoards.length < cacheSize && !generatingStandardBoard) {
      dispatch(generateNewBoard("standard"))
    }
  }, [cachedStandardBoards, dispatch, generatingStandardBoard])
  useEffect(() => {
    if (cachedSmallBoards.length < cacheSize && !generatingSmallBoard) {
      dispatch(generateNewBoard("small"))
    }
  }, [cachedSmallBoards, dispatch, generatingSmallBoard])

  return (
    <FullScreen className={"fullscreenStyle"} handle={handle}>
      <Stack gap={3} style={{ marginTop: "10pt", marginBottom: "20pt" }}>
        <AppGame />
        <Hints />
        <Controls handle={handle} />
      </Stack>
    </FullScreen>
  )
}

export default App
