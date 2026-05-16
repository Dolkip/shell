import { BoxRenderable } from "@opentui/core"
import { renderer } from "./renderer"
import { messageBox, textArea } from "./components/messagebox"

const app = new BoxRenderable(renderer, {
  id: "app",
  flexDirection: "column",
  width: "100%",
  height: "100%",
})

const main = new BoxRenderable(renderer, {
  id: "main",
  flexGrow: 1,
})

app.add(main)
app.add(messageBox)

renderer.root.add(app)
textArea.focus()