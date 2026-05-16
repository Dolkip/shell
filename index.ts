import { BoxRenderable } from "@opentui/core"
import { renderer } from "./renderer"
import { messageBox, textArea } from "./components/messagebox"
import { banner } from "./components/banner"

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
app.add(banner)

renderer.root.add(app)

//focuses on the text area so you start typing right away
textArea.focus()