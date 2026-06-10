import { BoxRenderable, TextRenderable } from "@opentui/core"
import { Theme } from "../theme"
import { renderer } from "../renderer"

export const banner = new BoxRenderable(renderer, {
    id: "banner",
    width: "100%",
    height: 1,
    flexDirection: "row",
    flexShrink: 0,
    backgroundColor: Theme.panel.alt,
})

export const bannerTitle = new TextRenderable(renderer, {
    id: "banner-title",
    content: "◐ Shell",
    fg: Theme.text,
})

export const bannerText = new TextRenderable(renderer, {
    id: "banner-text",
    content: " is a tiny Discord terminal client",
    fg: Theme.dim,
})

banner.add(bannerTitle)
banner.add(bannerText)