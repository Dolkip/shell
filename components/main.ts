import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { banner } from "./banner"
import { chatBox } from "./chat"
import { fetchMessages, client } from "../discord"
import { makeMessage } from "./message"
import config from "../config.toml" with { type: "toml" }

export const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
})

main.add(banner)
main.add(chatBox)
main.add(messageBox)

if (client.isReady()) {
    fetchMessages(config.id).then(messages => {
        for (const msg of messages) {
            chatBox.add(makeMessage(msg))
        }
    })
} else {
    client.once("ready", async () => {
        const messages = await fetchMessages(config.id)
        for (const msg of messages) {
            chatBox.add(makeMessage(msg))
        }
    })
}

client.on("messageCreate", (message) => {
    if (message.channelId === config.id) {
        chatBox.add(makeMessage(message))
    }
})

textArea.focus()