import { Client, Guild } from "discord.js"

export interface SystemContext {
  client: Client
  guild: Guild | null
  channel: { send: (content: string) => Promise<unknown>; guild?: Guild | null }
  reply: (...lines: string[]) => void
}
