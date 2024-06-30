import { Col, Container, Row } from "react-bootstrap"
import { useAppSelector } from "../app/hooks.ts"
import { selectBoard } from "../game/gameSlice.ts"

export function Hints() {
  const board = useAppSelector(selectBoard)
  if (!board) return <></>
  return (
    <Container>
      <Row>
        <Col className={"d-flex align-items-center"}>
          <div className={"mx-auto text-center"}>
            <small>
              Press and hold squares to reveal the hidden field or crop.
            </small>
            <br />
            <small>Below are listed how many hidden fields are left.</small>
          </div>
        </Col>
      </Row>
    </Container>
  )
}
