import { BoxRenderable, TextRenderable, TextAttributes } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"

export const channelHeader = new BoxRenderable(renderer, {
    id: "channel-header",
    width: "100%",
    flexShrink: 0,
    flexDirection: "row",
    gap: 1,
    backgroundColor: theme.panel.base,
})

export const guild = new TextRenderable(renderer, {
    id: "guild-name-header",
    content: "",
    fg: theme.accent,
    attributes: TextAttributes.BOLD
})

export const titleText = new TextRenderable(renderer, {
    id: "channel-title",
    content: "",
    fg: theme.text,
})

export const topicText = new TextRenderable(renderer, {
    id: "channel-topic",
    content: "",
    fg: theme.dim,
})

channelHeader.add(guild)
channelHeader.add(titleText)
channelHeader.add(topicText)

export function updateChannelDisplay(guildName: string, title: string, topic: string) {
    guild.content = guildName
    titleText.content = title
    topicText.content = topic
}
