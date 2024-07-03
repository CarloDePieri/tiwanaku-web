import { Button, Col, Container, Row, Stack } from "react-bootstrap"
import { FullScreenHandle } from "react-full-screen"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { pickFromCache, selectBoardUiState } from "../game/gameSlice.ts"
import "./Controls.css"

export function Controls({ handle }: Readonly<{ handle: FullScreenHandle }>) {
  const dispatch = useAppDispatch()
  const boardUiState = useAppSelector(selectBoardUiState)

  async function fsToggle() {
    if (handle.active) {
      await handle.exit()
    } else {
      await handle.enter()
    }
  }

  const controls = (
    <>
      <Button
        disabled={boardUiState === "loading"}
        className={"controls"}
        onClick={() => dispatch(pickFromCache("small"))}
      >
        Small
      </Button>
      <Button
        disabled={boardUiState === "loading"}
        className={"controls"}
        onClick={() => dispatch(pickFromCache("standard"))}
      >
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
            <div className={"mx-auto controlsText"}>Start a new game</div>
            <div className={"mx-auto"}>{controls}</div>
          </Stack>
        </Col>
        <Col md={"4"} className={"d-flex align-items-center"}>
          <Stack>
            <div className={"mx-auto controlsText"}>Controls</div>
            <div className={"mx-auto"}>
              <Button
                variant={"outline-primary"}
                className={"controls fsButton"}
                onClick={fsToggle}
              >
                {handle.active ? "Exit fullscreen" : "Go fullscreen"}
              </Button>
              <a
                href="https://github.com/CarloDePieri/tiwanaku-web"
                target="_blank"
                className={"btn btn-outline-primary controls"}
              >
                About
              </a>
            </div>
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}
