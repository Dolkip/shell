import { Guild, type NonThreadGuildBasedChannel } from "discord.js"
import { client } from "./client"

export async function fetchChannel(channelId: string) {
  const channel = await client.channels.fetch(channelId)

  if (!channel?.isTextBased()) {
    throw new Error("channel not text-based or real :(")
  }

  return channel
}

export async function fetchGuild(guildId: string): Promise<Guild> {
  return client.guilds.fetch(guildId)
}

export function getGuilds() {
    return Array.from(client.guilds.cache.keys());
}

export async function getGuildChannels(guild: Guild): Promise<NonThreadGuildBasedChannel[]> {
  const channels = await guild.channels.fetch()
  return Array.from(channels.values())
    .filter((ch): ch is NonThreadGuildBasedChannel => ch !== null)
    .sort((a, b) => a.position - b.position)
}
