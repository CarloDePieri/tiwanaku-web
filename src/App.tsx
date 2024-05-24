import "./App.css"
import Square from "./components/Square.tsx"
import { generateState } from "./game.ts"

function App() {
  // console.log(generateState())
  //
  // return <>
  //   OK
  // </>
  const state = generateState()
  console.log(state)

  return (
    <>
      table
      <div>
        {state.map((row) => {
          return (
            <div
              style={{ display: "flex" }}
              key={`row_${row[0].coordinates[0]}`}
            >
              {row.map((square) => {
                return (
                  <Square
                    key={`coord_${square.coordinates[0]}_${square.coordinates[1]}`}
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
