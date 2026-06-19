import { BoxRenderable, type Renderable } from "@opentui/core"
import { renderer } from "../renderer"

export function makePopup(content: Renderable): Promise<void> {
  const bg = new BoxRenderable(renderer, {
    position: "absolute",
    zIndex: 500,
    width: "100%",
    
    height: "100%",
    backgroundColor: "#00000080",
  })

  const popup = new BoxRenderable(renderer, {
    position: "absolute",
    zIndex: 1000,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  })

  
  popup.add(content)
  renderer.root.add(bg)
  renderer.root.add(popup)

  return new Promise<void>((resolve) => {
    function onKey(key: any) {
      if (key.name === "escape") {
        key.stopPropagation()
        renderer.keyInput.off("keypress", onKey)
        bg.destroy()
        popup.destroy()
        resolve()
      }
    }
    renderer.keyInput.on("keypress", onKey)
  })
}b  