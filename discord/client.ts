import { Client, GatewayIntentBits } from "discord.js"

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.on("ready", () => {
  console.log(`ready now! wooo! ${client.user?.tag}`)
})