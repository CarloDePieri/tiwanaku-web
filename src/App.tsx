import "./App.css"
import Square from "./components/Square.tsx"
import { generateBoard } from "./game/procedures.ts"

function App() {
  const board = generateBoard("small")
  return (
    <>
      table
      <div>
        {board.get().map((row, y) => {
          return (
            // TODO fix the key
            <div style={{ display: "flex" }} key={`row_${y}`}>
              {row.map((_, x) => {
                const square = board.getCell(x, y)
                return (
                  <Square
                    key={`coord_${square.coordinates.x}_${square.coordinates.y}`}
                    field={square.field}
                    size={square.size}
                    groupId={square.groupId}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default App
