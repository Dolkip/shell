import { Message } from "discord.js"

import { client } from "./client"
import { fetchChannel } from "./guilds"


/*
  bananana insanana
*/
export async function fetchMessages(
  channelId: string,
  limit = 50,
  offset = 0,
  chunkSize = 50
): Promise<Message[]> {
  const channel = await fetchChannel(channelId)
  const pageSize = Math.min(100, Math.max(1, chunkSize))

  let before: string | undefined
  let remainingOffset = Math.max(0, offset)

  while (remainingOffset > 0) {
    const skippedMessages = await channel.messages.fetch({
      limit: Math.min(pageSize, remainingOffset),
      before,
    })

    if (skippedMessages.size === 0) {
      return []
    }

    const oldestSkippedMessage = skippedMessages.last()

    if (!oldestSkippedMessage) {
      return []
    }

    remainingOffset -= skippedMessages.size
    before = oldestSkippedMessage.id
  }

  const fetchedMessages: Message[] = []
  let remainingLimit = Math.max(0, limit)

  while (remainingLimit > 0) {
    const page = await channel.messages.fetch({
      limit: Math.min(pageSize, remainingLimit),
      before,
    })

    if (page.size === 0) {
      break
    }

    fetchedMessages.push(...page.values())
    remainingLimit -= page.size

    const oldestFetchedMessage = page.last()

    if (!oldestFetchedMessage) {
      break
    }

    before = oldestFetchedMessage.id
  }

  return fetchedMessages.reverse()
}

/*
export async function fetchPinnedMessages(channelId: string): Promise<Message[]> {
  const channel = await fetchChannel(channelId)
  return channel.messages.fetchPins().then(messages => [...messages.items]).catch(console.error);
}
*/

/* 
  sends a message! wow! 
*/
export async function sendMessage(channelId: string, message: string) {
  const channel = await client.channels.fetch(channelId)

  if (!channel || !("send" in channel)) {
    throw new Error("cand sent message somehow")
    // this only exists to shut up typescript because it keeps complaining that channel might not have .send()
  }

  await channel.send(message)
}