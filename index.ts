import { client } from "./discord"
import kleur from "kleur"
import { ensureDirectories, loadConfig, loadState, config } from "./config"
import { loadTheme } from "./theme"

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

  await ensureDirectories()
  await loadConfig()
  await loadState()

  const token = process.env.DISCORD_TOKEN ?? config.discord.token
  if (!token) {
    Bun.write(Bun.stderr, "ERROR: No Discord token configured. Set DISCORD_TOKEN env var or token in ~/.shell/config.toml\n")
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
    client.once("clientReady", () => resolve())
  })

  console.log("discord ready! starting TUI...")

  await loadTheme()
  const { TUI } = await import("./tui")
  TUI()
}

main().catch((err) => {
  console.error(err)
  shutdown()
})
