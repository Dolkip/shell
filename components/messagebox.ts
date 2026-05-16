import { BoxRenderable, TextareaRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"

const LINES = 5 //to how many lines the textarea grows before we start scrolling

//the actual thing you type in
export const textArea = new TextareaRenderable(renderer, {
    width: "100%",
    minHeight: 1,
    maxHeight: LINES,
    flexShrink: 0,
    backgroundColor: Theme.textareabackground,
    focusedBackgroundColor: "#222222",
    textColor: Theme.text,
    cursorColor: Theme.accent,
})

//neat box it lives in
export const messageBox = new BoxRenderable(renderer, {
    id: "message-box",
    width: "100%",
    flexShrink: 0,
    marginTop: "auto",
    flexDirection: "column",
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
    padding: 0,
    backgroundColor: Theme.textareabackground,
})

//puts the thing in the box
messageBox.add(textArea)
