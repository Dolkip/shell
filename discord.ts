import { Client, GatewayIntentBits } from "discord.js";
import config from "./config.toml" with { type: "toml" }

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

let ready = false;

client.on("debug", console.log);
client.on("ready", () => {
  console.log("READY FIRED:", client.user?.tag);
});

await client.login(config.token);

export async function sendMessage(
    channelId: string,
    message: string
  ) {
    const channel = await client.channels.fetch(channelId);
  
    if (!channel || !("send" in channel)) {
      throw new Error("Channel cannot send messages");
    }
  
    await channel.send(message);
  }