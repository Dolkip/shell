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
import { loadGuildChannels, selectChannel, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused, setOnChannelSelect, syncChannelSelection, refreshDMChannels, getCurrentGuildId } from "./lib/channels"
import { isDMChannel } from "./discord/dms"
import { syncGuildSelection } from "./lib/guilds"
import { initializeChat, loadChannelMessages, loadOlderChunk, loadNewerChunk, setupChatScrollHandler, setupMessageListeners } from "./lib/chat-history"
import { dmBox, dmSearchBox, resetDmView, setOnDmCreated, isDmViewActive, selectNextResult, selectPrevResult } from "./components/dmview"

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
        if (channelId === "__new_dm__") {
            showDmView()
            return
        }
        if (isDmViewActive()) {
            hideDmView()
        }
        void switchChannel(channelId)
    })

    const guildIds = getGuilds();
    if (guildIds.length > 0) {
        const currentChannel = currentChannelId
            ? await client.channels.fetch(currentChannelId).catch(() => null)
            : null

        if (currentChannel && isDMChannel(currentChannelId)) {
            syncGuildSelection("dm")
            const dmChannelId = await loadGuildChannels("dm", currentChannelId);
            if (dmChannelId) {
                await switchChannel(dmChannelId);
            }
        } else {
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
    }

    guildMenu.on(TabSelectRenderableEvents.ITEM_SELECTED, (_index: number, option: TabSelectOption) => {
        if (typeof option.value !== "string") return

        if (option.value === "dm") {
            hideDmView()
            void loadGuildChannels("dm").then(() => {
                showDmView()
            })
            return
        }

        hideDmView()
        void loadGuildChannels(option.value)
            .then((channelId) => {
                if (channelId) {
                    selectChannel(channelId)
                }
            })
    })

    renderer.root.add(app)
    setupMessageListeners()
    setupChatScrollHandler()
    textArea.focus()
    setupGuildKeyHandler()

    setOnDmCreated(async (channelId: string) => {
        hideDmView()
        if (getCurrentGuildId() === "dm") {
            await loadGuildChannels("dm", channelId)
        }
        void switchChannel(channelId)
    })

    client.on("channelCreate", (channel) => {
        if (channel.isDMBased()) {
            void refreshDMChannels()
        }
    })

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

    renderer.keyInput.on("keypress", (key: any) => {
        if (key.ctrl && key.name === "n") {
            if (getGuilds().length === 0) return
            if (isDmViewActive()) return
            syncGuildSelection("dm")
            void loadGuildChannels("dm").then(() => {
                showDmView()
            })
            return
        }

        if (key.name === "escape" && isDmViewActive()) {
            if (renderer.root.findDescendantById("dm-user-select")?.focused) {
                dmSearchBox.focus()
                return
            }
            hideDmView()
            return
        }

        if (isDmViewActive() && dmSearchBox.focused) {
            if (key.name === "down") {
                selectNextResult()
                return
            }
            if (key.name === "up") {
                selectPrevResult()
                return
            }
        }
    })
}

let dmViewActive = false

function showDmView() {
    if (dmViewActive) return
    dmViewActive = true
    main.remove(contentArea.id)
    main.add(dmBox)
    dmSearchBox.focus()
}

function hideDmView() {
    if (!dmViewActive) return
    dmViewActive = false
    resetDmView()
    main.remove(dmBox.id)
    main.add(contentArea)
    textArea.focus()
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
