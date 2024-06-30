import "./App.css"
import { Stack } from "react-bootstrap"
import { FullScreen, useFullScreenHandle } from "react-full-screen"
import Board from "./components/Board.tsx"
import { Controls } from "./components/Controls.tsx"
import { Fields } from "./components/Fields.tsx"
import { Hints } from "./components/Hints.tsx"

function App() {
  const handle = useFullScreenHandle()
  return (
    <FullScreen className={"fullscreenStyle"} handle={handle}>
      <Stack gap={3} style={{ marginTop: "10pt", marginBottom: "20pt" }}>
        <Board />
        <Hints />
        <Fields />
        <Controls handle={handle} />
      </Stack>
    </FullScreen>
  )
}

export default App
