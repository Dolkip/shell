import { Client, GatewayIntentBits } from "discord.js"

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.DirectMessages,
  ],
})

client.on("clientReady", () => {
  console.log(`connected to shellbot ${client.user?.tag}`)
})