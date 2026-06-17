import { Glob } from "bun"
import { join } from "node:path"
import { z } from "zod"
import { Guild } from "discord.js"
import { client } from "./discord/client"
import { currentChannelId } from "./config"
import type { SystemContext } from "./types"

const SYSTEM_DIR = join(import.meta.dir, "system")

export interface SystemCommand {
  name: string
  aliases?: string[]
  description?: string
  schema: z.ZodType
  execute: (args: unknown, ctx: SystemContext) => Promise<void>
}

export function defineCommand<T extends z.ZodType>(def: {
  name: string
  aliases?: string[]
  description?: string
  schema: T
  execute: (args: z.output<T>, ctx: SystemContext) => Promise<void>
}): SystemCommand {
  return def as unknown as SystemCommand
}

const commands = new Map<string, SystemCommand>()

for await (const file of new Glob("*.ts").scan(SYSTEM_DIR)) {
  try {
    const mod = await import(join(SYSTEM_DIR, file))
    const cmd = mod?.default as SystemCommand | undefined
    if (cmd?.name) {
      commands.set(cmd.name, cmd)
      for (const alias of cmd.aliases ?? [])
        commands.set(alias, cmd)
    }
  } catch (e) {
    console.error(`failed to load system command ${file}:`, e)
  }
}

export function getCommands(): ReadonlyMap<string, SystemCommand> {
  return commands
}

export function parseArgs(input: string): string[] {
  const args: string[] = []
  let cur = "", q: '"' | "'" | null = null, esc = false
  for (const ch of input) {
    if (esc) { cur += ch; esc = false }
    else if (ch === "\\" && q !== "'") { esc = true }
    else if (q) { if (ch === q) q = null; else cur += ch }
    else if (ch === '"' || ch === "'") { q = ch }
    else if (ch === " " && cur) { args.push(cur); cur = "" }
    else cur += ch
  }
  if (cur) args.push(cur)
  return args
}

function send(channel: { send: (s: string) => Promise<unknown> }, ...lines: string[]) {
  return channel.send(`\`\`\`\n${lines.join("\n")}\n◐ Shell System\n\`\`\``)
}

export async function systemCommand(command: string[]): Promise<void> {
  const name = command[0]
  if (!name) return

  const channelId = currentChannelId
  if (!channelId) { console.log("no channel selected"); return }

  const raw = client.channels.cache.get(channelId)
  if (!raw || !("send" in raw)) {
    console.log("current channel cannot send messages")
    return
  }
  const channel = raw as { send: (content: string) => Promise<unknown>; guild?: Guild | null }

  const cmd = commands.get(name)
  if (!cmd) {
    await send(channel, `unknown command: ${name}`)
    return
  }

  const lines: string[] = []
  const ctx: SystemContext = {
    client,
    guild: channel.guild ?? null,
    channel,
    reply: (...texts) => lines.push(...texts),
  }

  try {
    await cmd.execute(cmd.schema.parse(command.slice(1)), ctx)
  } catch (e: unknown) {
    lines.push(e instanceof Error ? e.message : String(e))
  }

  if (lines.length) await send(channel, ...lines)
}
