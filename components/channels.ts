import { BoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";

const WIDTH = 30

export const channelMenu = new BoxRenderable(renderer, {
    id: "channel-menu",
    flexDirection: "column",
    width: WIDTH,
    flexShrink: 0,
    minHeight: 0,
})
