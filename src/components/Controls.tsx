import { useState } from "react"
import { Button, Col, Container, Row, Stack } from "react-bootstrap"
import { FullScreenHandle } from "react-full-screen"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { BoardSize } from "../game/GameBoard.ts"
import {
  abortNewBoardGeneration,
  generateNewBoard,
  GenerateNewBoardPromise,
  selectGeneratingBoard,
} from "../game/gameSlice.ts"

export function Controls({ handle }: Readonly<{ handle: FullScreenHandle }>) {
  const [promise, setPromise] = useState<GenerateNewBoardPromise | null>(null)

  const loading = useAppSelector(selectGeneratingBoard)
  const dispatch = useAppDispatch()

  function abortGeneration() {
    // stop the current generation
    if (promise) abortNewBoardGeneration(promise)
  }

  async function fsToggle() {
    if (handle.active) {
      await handle.exit()
    } else {
      await handle.enter()
    }
  }

  const generate = (size: BoardSize) => {
    // if there was a previous request, cancel it
    if (loading) {
      abortGeneration()
    }
    setPromise(dispatch(generateNewBoard(size)))
  }

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
          &nbsp;
        </Col>
        <Col md={"4"} className={"d-flex align-items-center"}>
          <Stack>
            <div className={"mx-auto controlsText"}>
              {loading ? "Generating..." : "Generate a new board"}
            </div>
            <div className={"mx-auto"}>{controls}</div>
          </Stack>
        </Col>
        <Col md={"4"} className={"d-flex align-items-center"}>
          <Stack>
            <div className={"mx-auto controlsText"}>Settings</div>
            <div className={"mx-auto"}>
              <Button
                variant={"outline-primary"}
                className={"controls fsButton"}
                onClick={fsToggle}
              >
                {handle.active ? "Exit fullscreen" : "Go fullscreen"}
              </Button>
            </div>
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}
