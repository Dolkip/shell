import { ScrollBoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme"

export const chatBox = new ScrollBoxRenderable(renderer, {
    id: "chat-box",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    viewportCulling: true,
    scrollbarOptions: {
        trackOptions: {
            backgroundColor: Theme.scrollbar.track,
            foregroundColor: Theme.scrollbar.thumb,
        },
    },
})
