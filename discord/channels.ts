import { client } from "./client"

export async function fetchChannel(channelId: string) {
  const channel = await client.channels.fetch(channelId)

  if (!channel?.isTextBased()) {
    throw new Error("channel not text-based or real :(")
  }

  return channel
}

export function getGuilds() {
    return Array.from(client.guilds.cache.keys());
}

export async function getGuildChannels(guildId: string) {
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
        throw new Error("guild does not exist")
    }

    const channels = await guild.channels.fetch();
    return Array.from(channels.keys());
}