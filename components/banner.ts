import { BoxRenderable, TextRenderable, InputRenderable } from "@opentui/core"
import { Theme } from "../theme"
import { renderer } from "../renderer"

export const banner = new BoxRenderable(renderer, {
    id: "banner",
    width: "100%",
    height: 1,
    flexDirection: "row",
    flexShrink: 0,
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
    fg: Theme.dim,
})

export const search = new InputRenderable(renderer, {
    id: "search",
    placeholder: '🔍\uFE0E' + "Search...",
    width: 20,
    backgroundColor: Theme.input.base,
    focusedBackgroundColor: Theme.input.focused,
    textColor: Theme.input.text,
    cursorColor: Theme.input.cursor,
    marginLeft: "auto",
})

banner.add(bannerTitle)
banner.add(bannerText)
banner.add(search)