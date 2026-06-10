import { guild, titleText, topicText } from "../components/channeldisplay"

export function updateChannelDisplay(guildName: string, title: string, topic: string) {
    guild.content = guildName ? guildName : ""
    titleText.content = " " + title
    topicText.content = " " + topic
}
