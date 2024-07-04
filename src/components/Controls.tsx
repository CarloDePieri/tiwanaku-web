import { Button, Col, Container, Row, Spinner, Stack } from "react-bootstrap"
import { FullScreenHandle } from "react-full-screen"
import { useAppDispatch, useAppSelector } from "../app/hooks.ts"
import { BoardSize } from "../game/GameBoard.ts"
import {
  pickFromCache,
  selectBoardUiState,
  selectCachedSmallBoards,
  selectCachedStandardBoards,
} from "../game/gameSlice.ts"
import "./Controls.css"
import { Fullscreen, FullscreenExit } from "react-bootstrap-icons"

export function Controls({ handle }: Readonly<{ handle: FullScreenHandle }>) {
  const dispatch = useAppDispatch()
  const boardUiState = useAppSelector(selectBoardUiState)
  const cachedSmallBoards = useAppSelector(selectCachedSmallBoards)
  const cachedStandardBoards = useAppSelector(selectCachedStandardBoards)

  const firstLoadingSmall =
    cachedSmallBoards.length === 0 && boardUiState === "empty"
  const firstLoadingStandard =
    cachedStandardBoards.length === 0 && boardUiState === "empty"

  async function fsToggle() {
    if (handle.active) {
      await handle.exit()
    } else {
      await handle.enter()
    }
  }

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // provide a spinner when needed, in addition to the button text
  const getControlButtonContent = (size: BoardSize) => {
    const check = size === "small" ? firstLoadingSmall : firstLoadingStandard
    return check || boardUiState === "loading" ? (
      <Stack direction={"horizontal"} gap={2}>
        <Spinner
          as="span"
          size="sm"
          animation="border"
          className={"spinner-animation"}
        />
        <span>{capitalize(size)}</span>
      </Stack>
    ) : (
      <span>{capitalize(size)}</span>
    )
  }

  const controls = (
    <>
      <Button
        disabled={boardUiState === "loading" || firstLoadingSmall}
        className={"controls"}
        onClick={() => dispatch(pickFromCache("small"))}
      >
        {getControlButtonContent("small")}
      </Button>
      <Button
        disabled={boardUiState === "loading" || firstLoadingStandard}
        className={"controls"}
        onClick={() => dispatch(pickFromCache("standard"))}
      >
        {getControlButtonContent("standard")}
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
            <div className={"w-auto"}>
              <Button
                variant={"outline-primary"}
                className={"controls fsButton"}
                onClick={fsToggle}
              >
                <Stack direction={"horizontal"} gap={1}>
                  {handle.active ? <FullscreenExit /> : <Fullscreen />}
                  <span>Fullscreen</span>
                </Stack>
              </Button>
              <a
                href="https://github.com/CarloDePieri/tiwanaku-web"
                target="_blank"
                className={"btn btn-outline-primary controls"}
              >
                Info
              </a>
            </div>
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}
