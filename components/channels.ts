import { BoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";

export const channelMenu = new BoxRenderable(renderer, {
    id: "channel-menu",
    flexDirection: "column",
    width: 35,
    flexShrink: 0,
    minHeight: 0,
})
