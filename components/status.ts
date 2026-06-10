import { BoxRenderable, TextRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"

export const statusBar = new BoxRenderable(renderer, {
    id: "status-bar",
    width: "100%",
    height: 1,
    flexShrink: 0,
    flexDirection: "row",
    backgroundColor: Theme.panel.alt,
})

const statusText = new TextRenderable(renderer, {
    id: "status-text",
    content: "Ready",
    fg: Theme.dim,
})

const statusHelp = new TextRenderable(renderer, {
    id: "status-help",
    content: "↑↓ select · Enter open · Alt+↑/↓ history",
    fg: Theme.dim,
    marginLeft: "auto",})

statusBar.add(statusText)
statusBar.add(statusHelp)

export function setStatus(message: string) {
    statusText.content = message
}
