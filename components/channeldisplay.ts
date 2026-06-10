import { BoxRenderable, TextRenderable, TextAttributes } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"

export const channelHeader = new BoxRenderable(renderer, {
    id: "channel-header",
    width: "100%",
    flexShrink: 0,
    flexDirection: "row",
    backgroundColor: Theme.panel.base,
})

const guild = new TextRenderable(renderer, {
    id: "guild-name-header",
    content: "",
    fg: Theme.accent,
    attributes: TextAttributes.BOLD
})

const titleText = new TextRenderable(renderer, {
    id: "channel-title",
    content: "",
    fg: Theme.text,
})

const topicText = new TextRenderable(renderer, {
    id: "channel-topic",
    content: "",
    fg: Theme.dim,
})

channelHeader.add(guild)
channelHeader.add(titleText)
channelHeader.add(topicText)


export function updateChannelDisplay(guildName: string, title: string, topic: string) {
    guild.content = guildName ? `${guildName} / ` : ""
    titleText.content = title
    topicText.content = " " + topic
}
