import { Col, Container, Row } from "react-bootstrap"
import { useAppSelector } from "../app/hooks.ts"
import { Field } from "../game/enums.ts"
import { selectBoard } from "../game/gameSlice.ts"
import { getBackgroundImage } from "./Square.tsx"
import "./Fields.css"

function HiddenField({ field, num }: Readonly<{ field: Field; num: number }>) {
  return (
    <div
      style={{
        backgroundImage: `url(${getBackgroundImage(field)})`,
      }}
      className={"d-flex align-items-center field"}
    >
      <div className={"mx-auto fieldsText field--text"}>{num}</div>
    </div>
  )
}

export function Fields() {
  const board = useAppSelector(selectBoard)

  if (board) {
    const fields = Object.values(Field).map((field) => (
      <Col xs={"auto"} key={field}>
        <HiddenField field={field} num={board.undiscoveredFields[field]} />
      </Col>
    ))
    return (
      <Container>
        <Row className="justify-content-center">{fields}</Row>
      </Container>
    )
  } else {
    return <></>
  }
}
