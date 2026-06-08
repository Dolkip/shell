import { Client, GatewayIntentBits } from "discord.js"

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
})

client.on("clientReady", () => {
  console.log(`ready now! wooo! ${client.user?.tag}`)
})