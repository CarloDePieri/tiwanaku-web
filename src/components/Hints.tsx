import { Col, Container, Row } from "react-bootstrap"
import { useAppSelector } from "../app/hooks.ts"
import { selectBoard, selectBoardUiState } from "../game/gameSlice.ts"
import { areHintsOnTheSide } from "./areHintsOnTheSide.ts"
import useWindowDimensions from "./useWindowDimensions.ts"

export function Hints() {
  const boardUiState = useAppSelector(selectBoardUiState)
  const board = useAppSelector(selectBoard)
  const dim = useWindowDimensions()
  if (!board) return <></>
  const position = areHintsOnTheSide(dim) ? "On the left" : "Below the board"
  return boardUiState === "loaded" ? (
    <Container>
      <Row>
        <Col className={"d-flex align-items-center"}>
          <div className={"mx-auto text-center"}>
            <small>
              Press and hold squares on the board to reveal the hidden field or
              crop.
            </small>
            <br />
            <small>{position} are listed how many hidden fields remain.</small>
          </div>
        </Col>
      </Row>
    </Container>
  ) : (
    <></>
  )
}
