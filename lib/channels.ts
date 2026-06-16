import { SelectRenderable, SelectRenderableEvents, type SelectOption } from "@opentui/core"
import { ChannelType } from "discord.js"
import { renderer } from "../renderer"
import { fetchGuild, getGuildChannels } from "../discord/guilds"
import { getDMChannels, getDMSenders, getDMChannelLastActivity } from "../discord/dms"
import { theme } from "../theme"
import { channelMenu } from "../components/channels"

interface ChannelOption extends SelectOption {
  value: string
}

let channelSelect: SelectRenderable | null = null
let currentGuildId: string | null = null
let channelOptions: ChannelOption[] = []

export let onChannelSelect: ((channelId: string) => void) | null = null

export function setOnChannelSelect(handler: (channelId: string) => void) {
  onChannelSelect = handler
}

function selectedChannelId(): string | null {
  const option = channelSelect?.getSelectedOption()
  return typeof option?.value === "string" ? option.value : null
}

export function selectChannel(channelId: string) {
  if (!channelId) return
  onChannelSelect?.(channelId)
}

function createChannelSelect(options: ChannelOption[], selectedIndex: number): SelectRenderable {
  const sel = new SelectRenderable(renderer, {
    id: "channel-select",
    options,
    selectedIndex,
    width: "100%",
    flexGrow: 1,
    textColor: theme.select.text,
    backgroundColor: theme.select.base,
    focusedBackgroundColor: theme.select.focused,
    focusedTextColor: theme.select.focusedText,
    selectedBackgroundColor: theme.select.selected,
    selectedTextColor: theme.select.selectedText,
    descriptionColor: theme.select.description,
    selectedDescriptionColor: theme.select.selectedDescription,
    showDescription: false,
  })

  sel.on(SelectRenderableEvents.ITEM_SELECTED, (_index: number, option: SelectOption) => {
    if (typeof option.value === "string") {
      selectChannel(option.value)
    }
  })

  return sel
}

export async function loadDMChannels(preferredChannelId?: string): Promise<string | null> {
  const needsRefresh = preferredChannelId
    && !channelOptions.some((option) => option.value === preferredChannelId)

  if (currentGuildId === "dm" && channelOptions.length > 0 && !needsRefresh) {
    const selected = preferredChannelId && channelOptions.some((option) => option.value === preferredChannelId)
      ? preferredChannelId
      : selectedChannelId() ?? channelOptions[0]?.value ?? null
    if (selected) syncChannelSelection(selected)
    return selected
  }

  currentGuildId = "dm"

  const dmChannels = await getDMChannels()

  channelOptions = dmChannels
    .map((dm) => ({
      name: getDMSenders(dm),
      description: dm.id,
      value: dm.id,
    }))
    .sort((a, b) => {
      const aCh = dmChannels.find((ch) => ch.id === a.value)
      const bCh = dmChannels.find((ch) => ch.id === b.value)
      const aLast = aCh ? getDMChannelLastActivity(aCh) : 0
      const bLast = bCh ? getDMChannelLastActivity(bCh) : 0
      return bLast - aLast
    })

  channelOptions = [{ name: "+ New DM", description: "", value: "__new_dm__" }, ...channelOptions]

  if (channelSelect) {
    channelSelect.destroy()
    channelSelect = null
  }

  const selectedIndex = Math.max(
    0,
    preferredChannelId
      ? channelOptions.findIndex((option) => option.value === preferredChannelId)
      : 0,
  )

  channelSelect = createChannelSelect(channelOptions, selectedIndex)
  channelMenu.add(channelSelect)
  return channelOptions[selectedIndex]?.value ?? null
}

export async function loadGuildChannels(guildId: string, preferredChannelId?: string): Promise<string | null> {
  if (guildId === "dm") return loadDMChannels(preferredChannelId)

  if (currentGuildId === guildId && channelOptions.length > 0) {
    const selected = preferredChannelId && channelOptions.some((option) => option.value === preferredChannelId)
      ? preferredChannelId
      : selectedChannelId() ?? channelOptions[0]?.value ?? null
    if (selected) syncChannelSelection(selected)
    return selected
  }

  currentGuildId = guildId

  const guild = await fetchGuild(guildId)
  const channels = await getGuildChannels(guild)

  channelOptions = channels
    .filter(ch => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement)
    .map(ch => ({
      name: "#" + ch.name,
      description: ch.id,
      value: ch.id,
    }))

  if (channelSelect) {
    channelSelect.destroy()
    channelSelect = null
  }

  if (channelOptions.length === 0) return null

  const selectedIndex = Math.max(
    0,
    preferredChannelId
      ? channelOptions.findIndex((option) => option.value === preferredChannelId)
      : 0,
  )

  channelSelect = createChannelSelect(channelOptions, selectedIndex)
  channelMenu.add(channelSelect)
  return channelOptions[selectedIndex]?.value ?? null
}

export function syncChannelSelection(channelId: string) {
  if (!channelSelect) return
  const idx = channelOptions.findIndex((option) => option.value === channelId)
  if (idx >= 0) {
    channelSelect.setSelectedIndex(idx)
  }
}

export async function initGuildSelector(guildIdsList: string[], targetGuildId?: string, targetChannelId?: string) {
  if (guildIdsList.length === 0) return null

  const guildId = targetGuildId && guildIdsList.includes(targetGuildId)
    ? targetGuildId
    : guildIdsList[0]!

  return loadGuildChannels(guildId, targetChannelId)
}

export function getCurrentGuildId(): string | null {
  return currentGuildId
}

export async function refreshDMChannels() {
  if (currentGuildId === "dm") return loadDMChannels()
  return null
}
