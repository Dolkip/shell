import { BoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";

export const guildMenuContainer = new BoxRenderable(renderer, {
    id: "guild-menu-container",
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
})
