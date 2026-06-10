import { BoxRenderable, TextRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"

export const statusBar = new BoxRenderable(renderer, {
    id: "status-bar",
    width: "100%",
    height: 1,
    flexShrink: 0,
    backgroundColor: Theme.panel.alt,
})

const statusText = new TextRenderable(renderer, {
    id: "status-text",
    content: "Ready",
    fg: Theme.dim,
})

statusBar.add(statusText)

export function setStatus(message: string) {
    statusText.content = message
}
