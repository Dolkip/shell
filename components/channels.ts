import { BoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";

export const channelMenu = new BoxRenderable(renderer, {
    id: "channel-menu",
    flexDirection: "column",
    width: 35,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
})
