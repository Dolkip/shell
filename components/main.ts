import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { messageBox, textArea } from "./messagebox"
import { banner } from "./banner"
import { chatBox } from "./chat"
import { fetchMessages, client } from "../discord"
import { makeMessage } from "./message"
import { getGuilds } from "../discord"
import { guildsMenu, initGuildSelector, setupGuildKeyHandler, setGuildSelectorFocused } from "./guildmenu"
import { config } from "../config"
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

let chat: BoxRenderable[] = []

async function renderMessages(messages: Message[]) {
    return Promise.all(messages.map((message) => makeMessage(message)))
}

function rerenderChat() {
    for (const child of chatBox.getChildren()) {
        chatBox.remove(child.id)
    }

    for (const child of chat) {
        chatBox.add(child)
    }
}

async function initializeChat() {
    const channel = await client.channels.fetch(config.discord.id)
    const guild = channel.guild
    if (guild) {
        await guild.members.fetch()
    }
    const messages = await fetchMessages(config.discord.id, WINDOW_SIZE, 0, CHUNK_SIZE)
    chat = await renderMessages(messages)
    position = 0
    rerenderChat() 
    chatBox.scrollTo(chatBox.scrollHeight)
}

async function loadOlderChunk() {
    if (isHistoryLoading) {
        return
    }

    isHistoryLoading = true

    try {
        const offsetForOlderChunk = position + chat.length
        const olderMessages = await fetchMessages(config.discord.id, CHUNK_SIZE, offsetForOlderChunk, CHUNK_SIZE)

        if (olderMessages.length === 0) {
            return
        }

        const olderChunk = await renderMessages(olderMessages)
        const removeCount = Math.min(olderChunk.length, chat.length)
        const retained = chat.slice(0, Math.max(0, chat.length - removeCount))

        chat = [...olderChunk, ...retained]
        position += olderChunk.length

        rerenderChat()
        chatBox.scrollTop = 0
    } finally {
        isHistoryLoading = false
    }
}

async function loadNewerChunk() {
    if (isHistoryLoading || position <= 0) {
        return
    }

    isHistoryLoading = true

    try {
        const takeCount = Math.min(CHUNK_SIZE, position)
        const offsetForNewerChunk = position - takeCount
        const newerMessages = await fetchMessages(config.discord.id, takeCount, offsetForNewerChunk, CHUNK_SIZE)

        if (newerMessages.length === 0) {
            return
        }

        const newerChunk = await renderMessages(newerMessages)
        const removeCount = Math.min(newerChunk.length, chat.length)
        const retained = chat.slice(removeCount)

        chat = [...retained, ...newerChunk]
        position = Math.max(0, position - newerChunk.length)

        rerenderChat()

        if (position === 0) {
            chatBox.scrollTo(chatBox.scrollHeight)
        } else {
            chatBox.scrollTop = Math.max(0, chatBox.scrollHeight - (chatBox.height ?? 0))
        }
    } finally {
        isHistoryLoading = false
    }
}

contentArea.add(chatBox)
contentArea.add(messageBox)

main.add(guildsMenu)
main.add(contentArea)

if (client.isReady()) {
    await initializeChat()
} else {
    client.once("clientReady", async () => {
        await initializeChat()
    })
}

if (client.isReady()) {
    const guilds = getGuilds();
    await initGuildSelector(guilds);
} else {
    client.once("clientReady", async () => {
        const guilds = getGuilds();
        await initGuildSelector(guilds);
    })
}

client.on("messageCreate", async (message) => {
    if (message.channelId === config.discord.id) {
        if (chat.some((m) => m.id === message.id)) {
            return
        }

        if (position > 0) {
            position += 1
            return
        }

        chat.push(await makeMessage(message))

        if (chat.length > WINDOW_SIZE) {
            chat = chat.slice(chat.length - WINDOW_SIZE)
        }

        rerenderChat()
        chatBox.scrollTo(chatBox.scrollHeight)
    }
})

client.on("messageDelete", async (message) => {
    if (message.channelId === config.discord.id) {
        const index = chat.findIndex((m) => m.id === message.id)
        if (index !== -1) {
            chat.splice(index, 1)
        }
        rerenderChat()
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

    if (key.name === "pageup" || (key.alt && key.name === "up")) {
        void loadOlderChunk();
        return;
    }

    if (key.name === "pagedown" || (key.alt && key.name === "down")) {
        void loadNewerChunk();
    }
});

