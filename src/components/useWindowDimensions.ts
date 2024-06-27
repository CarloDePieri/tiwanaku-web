import { useState, useEffect } from "react"

interface WindowDimensions {
  height: number
  width: number
}

// TODO something is wrong with this function (it's not returning the correct values when the windows is resized )

/**
 * Retrieve the available width and height of the window screen.
 *
 * @returns {WindowDimensions} An object containing the height and width of the window.
 */
function getWindowDimensions(): WindowDimensions {
  const deviceWidth = window.screen.availWidth
  const deviceHeight = window.screen.availHeight
  return {
    height: deviceHeight,
    width: deviceWidth,
  }
}

/**
 * Custom React Hook to get the window dimensions.
 * This hook returns the current window dimensions and updates them whenever the window is resized.
 *
 * @returns {WindowDimensions} The current window dimensions.
 */
export default function useWindowDimensions(): WindowDimensions {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  )

  useEffect(() => {
    // Update the window dimensions whenever the window is resized
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return windowDimensions
}
