import { Message } from "discord.js"

import { client } from "./client"
import { fetchChannel } from "./guilds"

export async function fetchMessages(
  channelId: string,
  limit = 50
): Promise<Message[]> {
  const channel = await fetchChannel(channelId)

  const messages = await channel.messages.fetch({ limit })

  return [...messages.values()].reverse()
}

export async function sendMessage(channelId: string, message: string) {
  const channel = await client.channels.fetch(channelId)

  if (!channel || !("send" in channel)) {
    throw new Error("cand sent message somehow")
    // this only exists to shut up typescript because it keeps complaining that channel might not have .send()
  }

  await channel.send(message)
}