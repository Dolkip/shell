import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { banner } from "./banner"
import { chatBox } from "./chat"
import { fetchMessages, client } from "../discord"
import { makeMessage } from "./message"
import { getGuilds } from "../discord"
import { guildsMenu, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused } from "./guildmenu"
import config from "../config.toml" with { type: "toml" }

export const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    flexDirection: "row",
})

const contentArea = new BoxRenderable(renderer, {
    id: "content-area",
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
})

contentArea.add(chatBox)
contentArea.add(messageBox)

main.add(guildsMenu)
main.add(contentArea)

if (client.isReady()) {
    fetchMessages(config.id).then(async messages => {
        for (const msg of messages) {
            chatBox.add(await makeMessage(msg))
        }
    })
} else {
    client.once("ready", async () => {
        const messages = await fetchMessages(config.id)
        for (const msg of messages) {
            chatBox.add(await makeMessage(msg))
        }
    })
}

if (client.isReady()) {
    const guilds = getGuilds();
    await initGuildSelector(guilds);
} else {
    client.once("ready", async () => {
        const guilds = getGuilds();
        await initGuildSelector(guilds);
    })
}

client.on("messageCreate", async (message) => {
    if (message.channelId === config.id) {
        chatBox.add(await makeMessage(message))
    }
})

textArea.focus()

setupGuildKeyHandler()

renderer.keyInput.on("keypress", (key: any) => {
    if (key.ctrl && key.name === "tab") {
        setGuildSelectorFocused(true);
    }
});