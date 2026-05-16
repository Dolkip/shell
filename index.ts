import { BoxRenderable } from "@opentui/core"
import { renderer } from "./renderer"
import { messageBox, textArea } from "./components/messagebox"

const app = new BoxRenderable(renderer, {
  id: "app",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  flexGrow: 1,
})

const main = new BoxRenderable(renderer, {
  id: "main",
  width: "100%",
  flexGrow: 1,
  flexShrink: 1,
  minHeight: 0,
})

app.add(main)
app.add(messageBox)

renderer.root.add(app)
textArea.focus()