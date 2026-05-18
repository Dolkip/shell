import { client } from "./discord"
import { TUI } from "./tui"
import kleur from "kleur"
import config from "./config.toml" with { type: "toml" }

function shutdown() {
  client.destroy().catch(() => {})
  process.exit(0)
}

process.on("SIGINT",  shutdown)
process.on("SIGTERM", shutdown)
process.on("SIGHUP",  shutdown)

async function main() {
  console.log("◐ Shell: " + kleur.dim("is a tiny Discord terminal client"))
  console.log("Starting...")

  const token = process.env.DISCORD_TOKEN ?? config.token
  if (!token) {
    Bun.write(Bun.stderr, "ERROR: No Discord token configured. Set DISCORD_TOKEN env var or token in config.toml\n")
    shutdown()
    return
  }

  try {
    await client.login(token)
  } catch (e) {
    Bun.write(Bun.stderr, `ERROR: Failed to login: ${e}\n`)
    shutdown()
    return
  }

  await new Promise<void>((resolve) => {
    client.once("ready", () => resolve())
  })

  console.log("discord ready! starting TUI...")

  TUI()
}

main().catch((err) => {
  console.error(err)
  shutdown()
})