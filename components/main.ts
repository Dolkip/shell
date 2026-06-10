import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { chatBox } from "./chat"
import { channelHeader, setChannelHeader } from "./channelheader"
import { statusBar, setStatus } from "./status"
import { fetchMessages, client, getGuilds } from "../discord"
import { makeMessage } from "./message"
import { channelMenu, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused, setOnChannelSelect, syncChannelSelection } from "./channels"
import { syncGuildSelection } from "./guilds"
import { config, currentChannelId, setCurrentChannelId } from "../config"
import { Message } from "discord.js"

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

let position = 0

const CHUNK_SIZE = config.chunkSize || 50
const WINDOW_CHUNKS = 3
const WINDOW_SIZE = CHUNK_SIZE * WINDOW_CHUNKS
let isHistoryLoading = false
let activeFetchToken = 0

let chat: BoxRenderable[] = []

if (!currentChannelId && config.id) {
    setCurrentChannelId(config.id)
}

async function renderMessages(messages: Message[]) {
    return Promise.all(messages.map((message) => makeMessage(message)))
}

function clearChatBox() {
    for (const child of chatBox.getChildren()) {
        chatBox.remove(child.id)
    }
}

function rerenderChat() {
    clearChatBox()

    for (const child of chat) {
        chatBox.add(child)
    }
}

function scrollChildIntoViewAfterLayout(childId: string) {
    chatBox.scrollChildIntoView(childId)
    process.nextTick(() => chatBox.scrollChildIntoView(childId))
}

async function fetchAndRenderMessages(channelId: string) {
    const fetchToken = ++activeFetchToken

    if (!channelId) {
        chat = []
        position = 0
        clearChatBox()
        setChannelHeader("# no channel selected")
        setStatus("No channel selected. Choose a channel from the sidebar.")
        return
    }

    setStatus("Loading messages…")
    const channel = await client.channels.fetch(channelId)
    if (fetchToken !== activeFetchToken) return
    if (!channel || !channel.isTextBased()) {
        setChannelHeader("# unavailable")
        setStatus("Selected channel is unavailable or is not text based.")
        return
    }

    const channelName = "name" in channel && typeof channel.name === "string" ? channel.name : channel.id
    const guildName = "guild" in channel && channel.guild ? channel.guild.name : "Direct messages"
    setChannelHeader(`# ${channelName}`, guildName)

    const messages = await fetchMessages(channelId, WINDOW_SIZE, 0, CHUNK_SIZE)
    if (fetchToken !== activeFetchToken) return

    if ("guild" in channel && channel.guild) {
        const authorIds = [...new Set(messages.map(m => m.author.id))]
        await Promise.allSettled(
            authorIds.map(id => channel.guild.members.fetch({ user: id }))
        )
    }
    if (fetchToken !== activeFetchToken) return

    chat = await renderMessages(messages)
    if (fetchToken !== activeFetchToken) return

    position = 0
    rerenderChat()
    chatBox.scrollTo(chatBox.scrollHeight)
    setStatus(messages.length === 0 ? "No messages in this channel yet." : `Loaded ${messages.length} messages.`)
}

export async function switchChannel(channelId: string) {
    if (channelId === currentChannelId) return;

    setCurrentChannelId(channelId);
    textArea.setText("");
    syncChannelSelection(channelId);

    try {
        await fetchAndRenderMessages(channelId);
        textArea.focus()
    } catch (error) {
        setStatus(`Failed to load channel: ${error}`)
    }
}

async function initializeChat() {
    try {
        await fetchAndRenderMessages(currentChannelId)
    } catch (error) {
        setStatus(`Failed to load initial channel: ${error}`)
    }
}

async function loadOlderChunk() {
    if (isHistoryLoading || !currentChannelId) {
        return
    }

    const channelId = currentChannelId
    const fetchToken = activeFetchToken
    isHistoryLoading = true
    setStatus("Loading older messages…")

    try {
        const offsetForOlderChunk = position + chat.length
        const olderMessages = await fetchMessages(channelId, CHUNK_SIZE, offsetForOlderChunk, CHUNK_SIZE)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        if (olderMessages.length === 0) {
            setStatus("No older messages available.")
            return
        }

        const olderChunk = await renderMessages(olderMessages)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        const anchorId = chat[0]?.id
        const removeCount = Math.min(olderChunk.length, chat.length)
        const retained = chat.slice(0, Math.max(0, chat.length - removeCount))

        chat = [...olderChunk, ...retained]
        position += olderChunk.length

        rerenderChat()
        if (anchorId) {
            scrollChildIntoViewAfterLayout(anchorId)
        } else {
            chatBox.scrollTo(0)
        }
        setStatus(`Loaded ${olderMessages.length} older messages. Previous top message is still visible.`)
    } catch (error) {
        setStatus(`Failed to load older messages: ${error}`)
    } finally {
        isHistoryLoading = false
    }
}

async function loadNewerChunk() {
    if (isHistoryLoading || position <= 0 || !currentChannelId) {
        return
    }

    const channelId = currentChannelId
    const fetchToken = activeFetchToken
    isHistoryLoading = true
    setStatus("Loading newer messages…")

    try {
        const takeCount = Math.min(CHUNK_SIZE, position)
        const offsetForNewerChunk = position - takeCount
        const newerMessages = await fetchMessages(channelId, takeCount, offsetForNewerChunk, CHUNK_SIZE)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        if (newerMessages.length === 0) {
            setStatus("No newer messages available.")
            return
        }

        const newerChunk = await renderMessages(newerMessages)
        if (fetchToken !== activeFetchToken || channelId !== currentChannelId) return

        const anchorId = chat.at(-1)?.id
        const removeCount = Math.min(newerChunk.length, chat.length)
        const retained = chat.slice(removeCount)

        chat = [...retained, ...newerChunk]
        position = Math.max(0, position - newerChunk.length)

        rerenderChat()

        if (anchorId) {
            scrollChildIntoViewAfterLayout(anchorId)
        } else if (position === 0) {
            chatBox.scrollTo(chatBox.scrollHeight)
        } else {
            chatBox.scrollTop = Math.max(0, chatBox.scrollHeight - (chatBox.height ?? 0))
        }
        setStatus(`Loaded ${newerMessages.length} newer messages. Previous bottom message is still visible.`)
    } catch (error) {
        setStatus(`Failed to load newer messages: ${error}`)
    } finally {
        isHistoryLoading = false
    }
}

contentArea.add(channelHeader)
contentArea.add(chatBox)
contentArea.add(statusBar)
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
        setStatus(`Failed to switch channel: ${error}`)
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

client.on("messageCreate", async (message) => {
    if (message.channelId === currentChannelId) {
        if (chat.some((m) => m.id === message.id)) {
            return
        }

        if (position > 0) {
            position += 1
            return
        }

        const renderedMessage = await makeMessage(message)
        if (message.channelId !== currentChannelId || chat.some((m) => m.id === message.id)) {
            return
        }

        chat.push(renderedMessage)

        if (chat.length > WINDOW_SIZE) {
            chat = chat.slice(chat.length - WINDOW_SIZE)
        }

        rerenderChat()
        chatBox.scrollTo(chatBox.scrollHeight)
        setStatus("New message received.")
    }
})

client.on("messageDelete", async (message) => {
    if (message.channelId === currentChannelId) {
        const index = chat.findIndex((m) => m.id === message.id)
        if (index !== -1) {
            chat.splice(index, 1)
        }
        rerenderChat()
        setStatus("Message deleted.")
    }
});

textArea.focus()

setupGuildKeyHandler()

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
