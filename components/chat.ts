import { BoxRenderable, ScrollBoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme"

export const chatBox = new ScrollBoxRenderable(renderer, {
    id: "chat-box",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
    stickyScroll: true,
    stickyStart: "bottom",
    viewportCulling: true,
})

export function chatScrollPosition() {
    const maxY = Math.max(0, chatBox.scrollHeight - (chatBox.height ?? 0))

    if (maxY === 0) {
        return 0
    }

    const normalized = chatBox.scrollTop / maxY
    return Math.max(0, Math.min(1, normalized))
}