import { BoxRenderable } from "@opentui/core"
import { renderer } from "./renderer"
import { main } from "./components/main" 

export function TUI() {
    const app = new BoxRenderable(renderer, {
      id: "app",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      flexGrow: 1,
    })
  
    app.add(main)
    renderer.root.add(app)
  }