import { CSSProperties, PropsWithChildren, RefObject } from "react"

interface DivProps extends PropsWithChildren {
  divRef?: RefObject<HTMLDivElement>
  style?: CSSProperties
}

export function CenteringDiv({ children, style, divRef }: Readonly<DivProps>) {
  return (
    <div
      ref={divRef}
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
