import { BoxRenderable, TextRenderable, TextAttributes } from "@opentui/core"
import { Theme } from "../theme"
import { renderer } from "../renderer"

export const banner = new BoxRenderable(renderer, {
    id: "banner",
    width: "100%",
    height: 1,
    flexDirection: "row",
    marginBottom: "auto",
})

export const bannerTitle = new TextRenderable(renderer, {
    id: "banner-title",
    content: "◐ Shell",
    fg: Theme.text,
    // attributes: TextAttributes.BOLD
})

export const bannerText = new TextRenderable(renderer, {
    id: "banner-text",
    content: " is a tiny Discord terminal client",
    fg: Theme.mutedText,
})

banner.add(bannerTitle)
banner.add(bannerText)