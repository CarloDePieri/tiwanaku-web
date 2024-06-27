import { expose } from "comlink"
import { generateBoard } from "./generation/GameGenerator.ts"

const payload = {
  generateBoard,
}

expose(payload)

export type ComlinkPayload = typeof payload
