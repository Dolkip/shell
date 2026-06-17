import { z } from "zod"
import { getCommands, defineCommand } from "../system"

export default defineCommand({
  name: "help",
  aliases: ["?"],
  description: "Show available system commands",
  schema: z.tuple([]),
  execute: async (_args, ctx) => {
    const commands = getCommands()
    ctx.reply("available commands:")
    for (const [name, cmd] of commands) {
      if (cmd.name !== name) continue
      const parts = [`  !${name}`]
      if (cmd.description) parts.push(` — ${cmd.description}`)
      if (cmd.aliases?.length) parts.push(` (${cmd.aliases.join(", ")})`)
      ctx.reply(parts.join(""))
    }
  },
})
