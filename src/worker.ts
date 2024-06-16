import { expose } from "comlink"
import { generateBoard } from "./game/GameController.ts"

const payload = {
  generateBoard,
}

expose(payload)

export type ComlinkPayload = typeof payload
