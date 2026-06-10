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
    fg: Theme.accent,
})

export const bannerText = new TextRenderable(renderer, {
    id: "banner-text",
    content: "  Discord terminal client",
    fg: Theme.dim,
})

export const bannerKeys = new TextRenderable(renderer, {
    id: "banner-keys",
    content: "Ctrl+Tab: channels  PgUp/PgDn: history  Ctrl+S: send",
    fg: Theme.dim,
    marginLeft: "auto",
})

banner.add(bannerTitle)
banner.add(bannerText)
banner.add(bannerKeys)
