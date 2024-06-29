import { useState } from "react"
import { Button, Col, Container, Row } from "react-bootstrap"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { BoardSize } from "../game/GameBoard.ts"
import {
  abortNewBoardGeneration,
  generateNewBoard,
  GenerateNewBoardPromise,
  selectGeneratingBoard,
} from "../game/gameSlice.ts"

export function Controls() {
  const [promise, setPromise] = useState<GenerateNewBoardPromise | null>(null)

  const loading = useAppSelector(selectGeneratingBoard)
  const dispatch = useAppDispatch()

  function abortGeneration() {
    // stop the current generation
    if (promise) abortNewBoardGeneration(promise)
  }

  const generate = (size: BoardSize) => {
    // if there was a previous request, cancel it
    if (loading) {
      abortGeneration()
    }
    setPromise(dispatch(generateNewBoard(size)))
  }

  const loadingMessage = (
    <div className={"mx-auto controlsText"}>
      {loading ? "Generating a new board..." : ""}
    </div>
  )

  const controls = loading ? (
    <Button
      variant={"danger"}
      className={"controls"}
      onClick={() => abortGeneration()}
    >
      Abort
    </Button>
  ) : (
    <>
      <Button className={"controls"} onClick={() => generate("small")}>
        Small
      </Button>
      <Button className={"controls"} onClick={() => generate("standard")}>
        Standard
      </Button>
    </>
  )

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={"4"} className={"d-flex align-items-center"}>
          <div className={"mx-auto controlsText"}>Generate a new board</div>
        </Col>
        <Col md={"4"} className={"d-flex align-items-center"}>
          <div className={"mx-auto"}>{controls}</div>
        </Col>
        <Col md={"4"} className={"d-flex align-items-center"}>
          {loadingMessage}
        </Col>
      </Row>
    </Container>
  )
}
