import { z } from "zod"
import { defineCommand } from "../system"

export default defineCommand({
  name: "nick",
  description: "change your nickname locally or globally, such as `!nick local meow`",
  schema: z.tuple([z.enum(["global", "local"]), z.string()])
    .transform(([scope, name]) => ({ scope, name })),
  execute: async (args, ctx) => {
    if (args.scope === "local") {
      if (!ctx.guild) {
        ctx.reply("this command can only be used in a server")
        return
      }
      const me = ctx.guild.members.me
      if (!me) {
        ctx.reply("could not find my own membership in this guild")
        return
      }
      try {
        await me.setNickname(args.name)
        ctx.reply(`nickname set to "${args.name}"`)
      } catch {
        ctx.reply("failed to set nickname in this guild")
      }
    } else {
      let count = 0
      for (const guild of ctx.client.guilds.cache.values()) {
        const me = guild.members.me
        if (!me) continue
        try {
          await me.setNickname(args.name)
          count++
        } catch { /* skip guilds where we lack permission */ }
      }
      ctx.reply(`nickname globally set to "${args.name}" (${count} guilds)`)
    }
  },
})
