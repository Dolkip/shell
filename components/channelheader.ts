import { BoxRenderable, TextRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"

export const channelHeader = new BoxRenderable(renderer, {
    id: "channel-header",
    width: "100%",
    height: 1,
    flexShrink: 0,
    flexDirection: "row",
    backgroundColor: Theme.panel.base,
})

const titleText = new TextRenderable(renderer, {
    id: "channel-title",
    content: "# no channel selected",
    fg: Theme.text,
})

const hintText = new TextRenderable(renderer, {
    id: "channel-hints",
    content: "Ctrl+Tab channels · PgUp/PgDn history · Ctrl+S send · ` console",
    fg: Theme.dim,
    marginLeft: "auto",
})

channelHeader.add(titleText)
channelHeader.add(hintText)

export function setChannelHeader(title: string, subtitle?: string) {
    titleText.content = title
    hintText.content = subtitle ?? "Ctrl+Tab channels · PgUp/PgDn history · Ctrl+S send · ` console"
}
