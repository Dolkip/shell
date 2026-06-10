import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { chatBox } from "./chat"
import { channelHeader } from "./channeldisplay"
// import { statusBar, setStatus } from "./status"
import { client, getGuilds } from "../discord"
import { channelMenu, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused, setOnChannelSelect, syncChannelSelection } from "./channels"
import { syncGuildSelection } from "./guilds"
import { config, currentChannelId, setCurrentChannelId } from "../config"
import { initializeChat, loadChannelMessages, loadOlderChunk, loadNewerChunk, setupChatScrollHandler, setupMessageListeners } from "./chat-history"

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

if (!currentChannelId && config.id) {
    setCurrentChannelId(config.id)
}

contentArea.add(channelHeader)
contentArea.add(chatBox)
// contentArea.add(statusBar)
contentArea.add(messageBox)

main.add(channelMenu)
main.add(contentArea)

if (client.isReady()) {
    await initializeChat()
} else {
    client.once("clientReady", async () => {
        await initializeChat()
    })
}

setOnChannelSelect((channelId: string) => {
    void switchChannel(channelId).catch((error) => {
        // setStatus(`Failed to switch channel: ${error}`)
    });
});

const guildIds = getGuilds();
if (guildIds.length > 0) {
    const currentChannel = currentChannelId
        ? await client.channels.fetch(currentChannelId).catch(() => null)
        : null
    const targetGuildId = currentChannel && "guildId" in currentChannel
        ? currentChannel.guildId ?? undefined
        : undefined

    const selectedChannelId = await initGuildSelector(guildIds, targetGuildId, currentChannelId);
    if (targetGuildId) syncGuildSelection(targetGuildId);
    if (currentChannelId) {
        syncChannelSelection(currentChannelId);
    } else if (selectedChannelId) {
        await switchChannel(selectedChannelId);
    }
}

setupMessageListeners()
setupChatScrollHandler()
textArea.focus()
setupGuildKeyHandler()

renderer.keyInput.on("keypress", (key: any) => {
    if (key.ctrl && key.name === "tab") {
        setGuildSelectorFocused(true);
        return;
    }

    if (renderer.root.findDescendantById("channel-select")?.focused) return;

    if (key.name === "pageup" || (key.alt && key.name === "up")) {
        void loadOlderChunk();
        return;
    }

    if (key.name === "pagedown" || (key.alt && key.name === "down")) {
        void loadNewerChunk();
    }
});

export async function switchChannel(channelId: string) {
    if (channelId === currentChannelId) return;

    setCurrentChannelId(channelId);
    textArea.setText("");
    syncChannelSelection(channelId);

    try {
        await loadChannelMessages(channelId);
        textArea.focus()
    } catch (error) {
        // setStatus(`Failed to load channel: ${error}`)
    }
}
