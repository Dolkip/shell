import { Client, GatewayIntentBits, TextChannel, Message, GuildMember } from "discord.js";
import config from "./config.toml" with { type: "toml" };

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`ready now! wooo! ${client.user?.tag}`);
});

export async function fetchChannel(channelId: string) {
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isTextBased()) {
    throw new Error("channel not text-based or real :(");
  }

  return channel;
}

export async function fetchMessages(
  channelId: string,
  limit = 50
): Promise<Message[]> {
  const channel = await fetchChannel(channelId);

  const messages = await channel.messages.fetch({ limit });

  return [...messages.values()].reverse();
}

export function getColour(member?: GuildMember, defaultColour = "#FFFFFF"): string {
  if (!member) return defaultColour;

  const role = member.roles.cache
    .filter(r => r.color && r.position > 0)
    .sort((a, b) => b.position - a.position)
    .first();

  return role?.hexColor ?? defaultColour;
}

export async function sendMessage(
  channelId: string,
  message: string
) {
  const channel = await client.channels.fetch(channelId);

  if (!channel || !("send" in channel)) {
    throw new Error("cand sent message somehow");
    // this only exists to shut up typescript because it keeps complaining that channel might not have .send()
  }

  await channel.send(message);
}