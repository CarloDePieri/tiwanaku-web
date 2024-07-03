import { WindowDimensions } from "./useWindowDimensions.ts"

export function areHintsOnTheSide(windowDimension: WindowDimensions): boolean {
  const screenSizeRatio = windowDimension.width / windowDimension.height
  return screenSizeRatio > 1.5
}
