import { BoxRenderable } from "@opentui/core"
import type { TabSelectOption } from "@opentui/core"
import { renderer } from "./renderer"
import { banner } from "./components/banner"
import { guildMenuContainer } from "./components/guilds"
import { setOnGuildItemSelected, refreshGuilds, ensureGuildMenu, syncGuildSelection } from "./lib/guilds"
import { channelMenu } from "./components/channels"
import { channelHeader } from "./components/channeldisplay"
import { chatBox } from "./components/chat"
import { messageBox, textArea } from "./components/messagebox"
import { config, currentChannelId, setCurrentChannelId, addPersistentDMChannel } from "./config"
import { client, getGuilds } from "./discord"
import { loadGuildChannels, selectChannel, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused, setOnChannelSelect, syncChannelSelection, refreshDMChannels, getCurrentGuildId } from "./lib/channels"
import { isDMChannel } from "./discord/dms"

import { initializeChat, loadChannelMessages, loadOlderChunk, loadNewerChunk, setupChatScrollHandler, setupMessageListeners } from "./lib/chat-history"
import { dmBox, dmSearchBox, resetDmView, setOnDmCreated, isDmViewActive, selectNextResult, selectPrevResult } from "./components/dmview"
import { userListBox, refreshUserList } from "./components/userlist"
import { focusManager, activateTabNavigation } from "./lib/focus"

const contentArea = new BoxRenderable(renderer, {
    id: "content-area",
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
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
    app.add(guildMenuContainer)
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

    setOnGuildItemSelected((_index: number, option: TabSelectOption) => {
        if (typeof option.value !== "string") return

        if (option.value === "dm") {
            hideDmView()
            hideUserList()
            void loadGuildChannels("dm").then(() => {
                showDmView()
            })
            return
        }

        hideDmView()
        hideUserList()
        void loadGuildChannels(option.value)
            .then((channelId) => {
                if (channelId) {
                    selectChannel(channelId)
                }
            })
    })

    ensureGuildMenu()
    await restoreStartupChannel()

    renderer.root.add(app)
    setupMessageListeners()
    setupChatScrollHandler()

    chatBox.focusable = true

    focusManager.register({
      id: "guild",
      focus: () => renderer.root.findDescendantById("guild-menu")?.focus(),
      blur: () => renderer.root.findDescendantById("guild-menu")?.blur(),
    })

    focusManager.register({
      id: "channels",
      focus: () => renderer.root.findDescendantById("channel-select")?.focus(),
      blur: () => renderer.root.findDescendantById("channel-select")?.blur(),
    })

    focusManager.register({
      id: "chat",
      focus: () => chatBox.focus(),
      blur: () => chatBox.blur(),
      isActive: () => !dmViewActive,
    })

    focusManager.register({
      id: "input",
      focus: () => textArea.focus(),
      blur: () => textArea.blur(),
      isActive: () => !dmViewActive,
    })

    focusManager.register({
      id: "dm-search",
      focus: () => dmSearchBox.focus(),
      blur: () => dmSearchBox.blur(),
      isActive: () => dmViewActive,
    })

    activateTabNavigation()
    focusManager.focusById("input")
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

    client.on("guildCreate", () => {
        refreshGuilds()
    })

    client.on("guildDelete", () => {
        refreshGuilds()
    })

    client.on("presenceUpdate", () => {
        if (userListVisible) refreshUserList()
    })

    renderer.keyInput.on("keypress", (key: any) => {
        if (key.ctrl && key.name === "tab") {
            setGuildSelectorFocused(true);
            return;
        }

        if (key.ctrl && key.name === "n") {
            if (getGuilds().length === 0 || isDmViewActive()) return
            syncGuildSelection("dm")
            void loadGuildChannels("dm").then(() => showDmView())
            return
        }

        if (key.ctrl && key.name === "u") {
            toggleUserList()
            return
        }

        if (renderer.root.findDescendantById("channel-select")?.focused) return;

        if (key.name === "pageup" || (key.alt && key.name === "up")) {
            void loadOlderChunk();
            return;
        }

        if (key.name === "pagedown" || (key.alt && key.name === "down")) {
            void loadNewerChunk();
            return;
        }

        if (key.name === "escape") {
            if (userListVisible) {
                hideUserList()
                return
            }
            if (isDmViewActive()) {
                if (renderer.root.findDescendantById("dm-user-select")?.focused) {
                    dmSearchBox.focus()
                    return
                }
                hideDmView()
                return
            }
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
    hideUserList()
    main.remove(contentArea.id)
    main.add(dmBox)
    focusManager.focusById("dm-search")
}

function hideDmView() {
    if (!dmViewActive) return
    dmViewActive = false
    resetDmView()
    main.remove(dmBox.id)
    main.add(contentArea)
    focusManager.focusById("input")
}

let userListVisible = false

function showUserList() {
    if (userListVisible) return
    userListVisible = true
    refreshUserList()
    main.add(userListBox)
}

function hideUserList() {
    if (!userListVisible) return
    userListVisible = false
    main.remove(userListBox.id)
}

function toggleUserList() {
    if (userListVisible) {
        hideUserList()
    } else {
        showUserList()
    }
}

async function switchChannel(channelId: string) {
    if (channelId === currentChannelId) return;

    setCurrentChannelId(channelId);
    textArea.setText("");
    syncChannelSelection(channelId);

    if (isDMChannel(channelId)) {
        addPersistentDMChannel(channelId)
    }

    await loadChannelMessages(channelId);
    textArea.focus()
}

async function restoreStartupChannel() {
    const guildIds = getGuilds();
    if (guildIds.length === 0) return

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
