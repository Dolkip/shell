import { BoxRenderable, TextRenderable } from "@opentui/core"
import { theme } from "../theme"
import { renderer } from "../renderer"

export const banner = new BoxRenderable(renderer, {
    id: "banner",
    width: "100%",
    height: 1,
    flexDirection: "row",
    flexShrink: 0,
    backgroundColor: theme.panel.alt,
})

export const bannerTitle = new TextRenderable(renderer, {
    id: "banner-title",
    content: "◐ Shell",
    fg: theme.text,
})

export const bannerText = new TextRenderable(renderer, {
    id: "banner-text",
    content: " is a tiny Discord terminal client",
    fg: theme.dim,
})

banner.add(bannerTitle)
banner.add(bannerText)