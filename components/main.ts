import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { banner } from "./banner"
import { chatBox } from "./chat"

export const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
})

main.add(banner)
main.add(chatBox)
main.add(messageBox)

//focuses on the text area so you start typing right away
textArea.focus()