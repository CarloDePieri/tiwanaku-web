import "./App.css"
import Board from "./components/Board.tsx"
import { Controls } from "./components/Controls.tsx"

function App() {
  return (
    <div>
      <Controls />
      <Board />
    </div>
  )
}

export default App
