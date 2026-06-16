import type { TabSelectOption } from "@opentui/core"
import { renderer } from "./renderer"
import { chatBox } from "./components/chat"
import { textArea } from "./components/messagebox"
import { dmBox, dmSearchBox, selectNextResult, selectPrevResult } from "./components/dmview"
import { userListBox, refreshUserList } from "./components/userlist"
import { config, currentChannelId, setCurrentChannelId, addPersistentDMChannel } from "./config"
import { client } from "./discord/client"
import { getGuilds } from "./discord/guilds"
import { isDMChannel } from "./discord/dms"
import { setOnDmCreated } from "./lib/dm"
import { loadGuildChannels, selectChannel, initGuildSelector, syncChannelSelection, refreshDMChannels, getCurrentGuildId, setOnChannelSelect } from "./lib/channels"
import { initializeChat, loadChannelMessages, setupMessageListeners, setupChatScrollHandler } from "./lib/chat-history"
import { syncGuildSelection, ensureGuildMenu, refreshGuilds, setOnGuildItemSelected } from "./lib/guilds"
import { focusManager, activateTabNavigation } from "./lib/focus"
import { setupKeybinds } from "./lib/keybinds"
import { buildApp, main, contentArea } from "./lib/layout"

export async function TUI() {
  const app = buildApp()

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
    if (dmViewActive) hideDmView()
    void switchChannel(channelId)
  })

  setOnGuildItemSelected((_index: number, option: TabSelectOption) => {
    if (typeof option.value !== "string") return
    if (option.value === "dm") {
      hideDmView()
      hideUserList()
      void loadGuildChannels("dm").then(() => showDmView())
      return
    }
    hideDmView()
    hideUserList()
    void loadGuildChannels(option.value).then((channelId) => {
      if (channelId) selectChannel(channelId)
    })
  })

  ensureGuildMenu()
  await restoreStartupChannel()

  renderer.root.add(app)
  setupMessageListeners()
  setupChatScrollHandler()

  chatBox.focusable = true

  focusManager.register({ id: "guild", focus: () => renderer.root.findDescendantById("guild-menu")?.focus(), blur: () => renderer.root.findDescendantById("guild-menu")?.blur() })
  focusManager.register({ id: "channels", focus: () => renderer.root.findDescendantById("channel-select")?.focus(), blur: () => renderer.root.findDescendantById("channel-select")?.blur() })
  focusManager.register({ id: "chat", focus: () => chatBox.focus(), blur: () => chatBox.blur(), isActive: () => !dmViewActive })
  focusManager.register({ id: "input", focus: () => textArea.focus(), blur: () => textArea.blur(), isActive: () => !dmViewActive })
  focusManager.register({ id: "dm-search", focus: () => dmSearchBox.focus(), blur: () => dmSearchBox.blur(), isActive: () => dmViewActive })

  activateTabNavigation()
  focusManager.focusById("input")

  setupKeybinds({
    onCtrlN: () => {
      if (getGuilds().length === 0 || dmViewActive) return
      syncGuildSelection("dm")
      void loadGuildChannels("dm").then(() => showDmView())
    },
    onCtrlU: () => toggleUserList(),
    onEscape: () => {
      if (userListVisible) { hideUserList(); return }
      if (dmViewActive) {
        if (renderer.root.findDescendantById("dm-user-select")?.focused) { dmSearchBox.focus(); return }
        hideDmView(); return
      }
    },
    onCtrlTab: () => { renderer.root.findDescendantById("channel-select")?.focus() },
    onDmDown: () => selectNextResult(),
    onDmUp: () => selectPrevResult(),
    isChannelSelectFocused: () => !!renderer.root.findDescendantById("channel-select")?.focused,
    isDmSearchFocused: () => dmSearchBox.focused,
    isDmActive: () => dmViewActive,
  })

  setOnDmCreated(async (channelId: string) => {
    hideDmView()
    if (getCurrentGuildId() === "dm") {
      await loadGuildChannels("dm", channelId)
    }
    void switchChannel(channelId)
  })

  client.on("channelCreate", (channel) => {
    if (channel.isDMBased()) void refreshDMChannels()
  })
  client.on("guildCreate", () => refreshGuilds())
  client.on("guildDelete", () => refreshGuilds())
  client.on("presenceUpdate", () => { if (userListVisible) refreshUserList() })
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
  dmSearchBox.value = ""
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
  userListVisible ? hideUserList() : showUserList()
}

async function switchChannel(channelId: string) {
  if (channelId === currentChannelId) return
  setCurrentChannelId(channelId)
  textArea.setText("")
  syncChannelSelection(channelId)
  if (isDMChannel(channelId)) addPersistentDMChannel(channelId)
  await loadChannelMessages(channelId)
  textArea.focus()
}

async function restoreStartupChannel() {
  const guildIds = getGuilds()
  if (guildIds.length === 0) return

  const currentChannel = currentChannelId
    ? await client.channels.fetch(currentChannelId).catch(() => null)
    : null

  if (currentChannel && isDMChannel(currentChannelId)) {
    syncGuildSelection("dm")
    const dmChannelId = await loadGuildChannels("dm", currentChannelId)
    if (dmChannelId) await switchChannel(dmChannelId)
  } else {
    const targetGuildId = currentChannel && "guildId" in currentChannel
      ? currentChannel.guildId ?? undefined
      : undefined

    const selectedChannelId = await initGuildSelector(guildIds, targetGuildId, currentChannelId)
    if (targetGuildId) syncGuildSelection(targetGuildId)
    if (currentChannelId) {
      syncChannelSelection(currentChannelId)
    } else if (selectedChannelId) {
      await switchChannel(selectedChannelId)
    }
  }
}
