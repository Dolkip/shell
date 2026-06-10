import { ScrollBoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { theme } from "../theme"

export const chatBox = new ScrollBoxRenderable(renderer, {
    id: "chat-box",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    stickyScroll: true,
    stickyStart: "bottom",
    viewportCulling: true,
    scrollbarOptions: {
        trackOptions: {
            backgroundColor: theme.scrollbar.track,
            foregroundColor: theme.scrollbar.thumb,
        },
    },
})
