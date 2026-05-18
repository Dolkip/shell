import { BoxRenderable } from "@opentui/core"
import { renderer } from "./renderer"
import { main } from "./components/main"
import { banner } from "./components/banner"

export function TUI() {
    const app = new BoxRenderable(renderer, {
      id: "app",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      flexGrow: 1,
    })

    app.add(banner)
    app.add(main)
    renderer.root.add(app)
  }