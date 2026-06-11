import { BoxRenderable } from "@opentui/core"
import { chatBox } from "../components/chat"
import { updateChannelDisplay } from "./channeldisplay"
import { fetchMessages, client } from "../discord"
import { getDMSenders } from "../discord/dms"
import { makeMessage } from "./message"
import { config, currentChannelId } from "../config"
import { Message } from "discord.js"

let position = 0
const CHUNK_SIZE = config.chunkSize || 50
const WINDOW_CHUNKS = 3
const WINDOW_SIZE = CHUNK_SIZE * WINDOW_CHUNKS
let isHistoryLoading = false
let activeFetchToken = 0
let messageNodes: BoxRenderable[] = []

async function renderMessages(messages: Message[]) {
    return Promise.all(messages.map((message) => makeMessage(message)))
}

function clearChatView() {
    for (const child of chatBox.getChildren()) {
        chatBox.remove(child.id)
    }
}

function rebuildChatView() {
    clearChatView()
    for (const child of messageNodes) {
        chatBox.add(child)
    }
}

function scrollChildIntoViewAfterLayout(childId: string) {
    chatBox.scrollChildIntoView(childId)
    process.nextTick(() => chatBox.scrollChildIntoView(childId))
}

export async function loadChannelMessages(channelId: string) {
    const fetchToken = ++activeFetchToken

    if (!channelId) {
        messageNodes = []
        position = 0
        clearChatView()
        updateChannelDisplay("", "#none", "")
        return
    }

    const channel = await client.channels.fetch(channelId)
    if (fetchToken !== activeFetchToken) return
    if (!channel || !channel.isTextBased()) {
        updateChannelDisplay("", "#unavailable", "")
        return
    }

    if (channel.isDMBased() && !channel.partial) {
        const sender = getDMSenders(channel)
        updateChannelDisplay("DMs", sender, "")
    } else {
        const guildName = "guild" in channel && channel.guild ? channel.guild.name : ""
        const channelName = "name" in channel ? channel.name : channel.id
        const channelTopic = (channel as any).topic ?? ""
        updateChannelDisplay(guildName, `#${channelName}`, channelTopic)
    }
    if (fetchToken !== activeFetchToken) return

    const messages = await fetchMessages(channelId, WINDOW_SIZE, 0, CHUNK_SIZE)
    if (fetchToken !== activeFetchToken) return

    if (!channel.isDMBased() && "guild" in channel && channel.guild) {
        const authorIds = [...new Set(messages.map(m => m.author.id))]
        await Promise.allSettled(
            authorIds.map(id => channel.guild.members.fetch({ user: id }))
        )
    }
    if (fetchToken !== activeFetchToken) return

    messageNodes = await renderMessages(messages)
    if (fetchToken !== activeFetchToken) return

    position = 0
    rebuildChatView()
    process.nextTick(() => chatBox.scrollTo(chatBox.scrollHeight))
}

export async function initializeChat() {
    try {
        await loadChannelMessages(currentChannelId)
    } catch {}
}

export async function loadOlderChunk() {
    if (isHistoryLoading || !currentChannelId) return

    const channelId = currentChannelId
    const fetchToken = activeFetchToken
    isHistoryLoading = true

    try {
        const offsetForOlderChunk = position + messageNodes.length
        const olderMessages = await fetchMessages(channelId, CHUNK_SIZE, offsetForOlderChunk, CHUNK_SIZE)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        if (olderMessages.length === 0) return

        const olderChunk = await renderMessages(olderMessages)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        const anchorId = messageNodes[0]?.id
        const removeCount = Math.min(olderChunk.length, messageNodes.length)
        const retained = messageNodes.slice(0, Math.max(0, messageNodes.length - removeCount))

        messageNodes = [...olderChunk, ...retained]
        position += olderChunk.length

        rebuildChatView()
        if (anchorId) {
            scrollChildIntoViewAfterLayout(anchorId)
        } else {
            chatBox.scrollTo(0)
        }
    } finally {
        isHistoryLoading = false
    }
}

export async function loadNewerChunk() {
    if (isHistoryLoading || position <= 0 || !currentChannelId) return

    const channelId = currentChannelId
    const fetchToken = activeFetchToken
    isHistoryLoading = true

    try {
        const takeCount = Math.min(CHUNK_SIZE, position)
        const offsetForNewerChunk = position - takeCount
        const newerMessages = await fetchMessages(channelId, takeCount, offsetForNewerChunk, CHUNK_SIZE)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        if (newerMessages.length === 0) return

        const newerChunk = await renderMessages(newerMessages)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        const anchorId = messageNodes.at(-1)?.id
        const removeCount = Math.min(newerChunk.length, messageNodes.length)
        const retained = messageNodes.slice(removeCount)

        messageNodes = [...retained, ...newerChunk]
        position = Math.max(0, position - newerChunk.length)

        rebuildChatView()

        if (anchorId) {
            scrollChildIntoViewAfterLayout(anchorId)
        } else if (position === 0) {
            chatBox.scrollTo(chatBox.scrollHeight)
        } else {
            chatBox.scrollTop = Math.max(0, chatBox.scrollHeight - (chatBox.height ?? 0))
        }
    } catch {
    } finally {
        isHistoryLoading = false
    }
}

export function setupMessageListeners() {
    client.on("messageCreate", async (message) => {
        if (message.channelId === currentChannelId) {
            if (messageNodes.some((m) => m.id === message.id)) return

            if (position > 0) {
                position += 1
                return
            }

            const renderedMessage = await makeMessage(message)
            if (message.channelId !== currentChannelId || messageNodes.some((m) => m.id === message.id)) return

            messageNodes.push(renderedMessage)

            if (messageNodes.length > WINDOW_SIZE) {
                messageNodes = messageNodes.slice(messageNodes.length - WINDOW_SIZE)
            }

            rebuildChatView()
            chatBox.scrollTo(chatBox.scrollHeight)
        }
    })

    client.on("messageDelete", async (message) => {
        if (message.channelId === currentChannelId) {
            const index = messageNodes.findIndex((m) => m.id === message.id)
            if (index !== -1) {
                messageNodes.splice(index, 1)
            }
            rebuildChatView()
        }
    })
}

export function setupChatScrollHandler() {
    chatBox.onMouseScroll = (event) => {
        const direction = event.scroll?.direction
        const maxY = Math.max(0, chatBox.scrollHeight - (chatBox.height ?? 0))

        if (direction === "up" && chatBox.scrollTop <= 0) {
            void loadOlderChunk()
            return
        }

        if (direction === "down" && chatBox.scrollTop >= maxY) {
            void loadNewerChunk()
        }
    }
}
