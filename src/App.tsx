import "./App.css"
import { Stack } from "react-bootstrap"
import Board from "./components/Board.tsx"
import { Controls } from "./components/Controls.tsx"
import { Fields } from "./components/Fields.tsx"
import { Hints } from "./components/Hints.tsx"

function App() {
  return (
    <Stack gap={3} style={{ marginTop: "10pt", marginBottom: "20pt" }}>
      <Controls />
      <Board />
      <Hints />
      <Fields />
    </Stack>
  )
}

export default App
