import { BoxRenderable } from "@opentui/core"
import { TabSelectRenderableEvents, type TabSelectOption } from "@opentui/core"
import { renderer } from "./renderer"
import { banner } from "./components/banner"
import { guildMenu } from "./components/guilds"
import { channelMenu } from "./components/channels"
import { channelHeader } from "./components/channeldisplay"
import { chatBox } from "./components/chat"
import { messageBox, textArea } from "./components/messagebox"
import { config, currentChannelId, setCurrentChannelId } from "./config"
import { client, getGuilds } from "./discord"
import { loadGuildChannels, selectChannel, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused, setOnChannelSelect, syncChannelSelection } from "./lib/channels"
import { syncGuildSelection } from "./lib/guilds"
import { initializeChat, loadChannelMessages, loadOlderChunk, loadNewerChunk, setupChatScrollHandler, setupMessageListeners } from "./lib/chat-history"

const contentArea = new BoxRenderable(renderer, {
    id: "content-area",
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
})

contentArea.add(channelHeader)
contentArea.add(chatBox)
contentArea.add(messageBox)

const main = new BoxRenderable(renderer, {
    id: "main",
    width: "100%",
    height: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    flexDirection: "row",
})

main.add(channelMenu)
main.add(contentArea)

export async function TUI() {
    const app = new BoxRenderable(renderer, {
      id: "app",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      flexGrow: 1,
    })

    app.add(banner)
    app.add(guildMenu)
    app.add(main)
    renderer.root.add(app)

    if (!currentChannelId && config.id) {
        setCurrentChannelId(config.id)
    }

    if (client.isReady()) {
        await initializeChat()
    } else {
        client.once("clientReady", async () => {
            await initializeChat()
        })
    }

    setOnChannelSelect((channelId: string) => {
        void switchChannel(channelId)
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

    guildMenu.on(TabSelectRenderableEvents.ITEM_SELECTED, (_index: number, option: TabSelectOption) => {
        if (typeof option.value !== "string") return

        void loadGuildChannels(option.value)
            .then((channelId) => {
                if (channelId) {
                    selectChannel(channelId)
                }
            })
    });

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
}

async function switchChannel(channelId: string) {
    if (channelId === currentChannelId) return;

    setCurrentChannelId(channelId);
    textArea.setText("");
    syncChannelSelection(channelId);

    try {
        await loadChannelMessages(channelId);
        textArea.focus()
    } catch {}
}
