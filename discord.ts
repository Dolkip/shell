import { Client, GatewayIntentBits } from "discord.js";
import config from "./config.toml" with { type: "toml" }

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.on("clientReady", () => {
  console.log("ready now! wooo!", client.user?.tag);
});

await client.login(config.token);

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