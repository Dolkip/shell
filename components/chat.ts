import { BoxRenderable, ScrollBox } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme"

export const chat = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
})

export const chatBox = new BoxRenderable(renderer, {
    id: "chat-box",
    width: "100%",
    flexShrink: 0,
    marginTop: "auto",
    flexDirection: "column",
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
    padding: 0,
})

//puts the thing in the box
chatBox.add(chat)