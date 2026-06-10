import { client } from "./discord"
import kleur from "kleur"
import { ensureDirectories, loadConfig, loadState, config } from "./config"
import { loadTheme } from "./theme"

function shutdown(exitCode = 0) {
  client.destroy().catch(() => {})
  process.exit(exitCode)
}

process.on("SIGINT",  () => shutdown())
process.on("SIGTERM", () => shutdown())
process.on("SIGHUP",  () => shutdown())

async function main() {
  console.log("◐ Shell " + kleur.dim("is a tiny Discord terminal client"))
  console.log("Starting...")

  await ensureDirectories()
  await loadConfig()
  await loadState()

  const token = process.env.DISCORD_TOKEN ?? config.token
  if (!token) {
    Bun.write(Bun.stderr, "ERROR: No Discord token configured. Set DISCORD_TOKEN env var or token in ~/.shell/config.toml\n")
    shutdown(1)
    return
  }

  try {
    await client.login(token)
  } catch (e) {
    Bun.write(Bun.stderr, `ERROR: Failed to login: ${e}\n`)
    shutdown(1)
    return
  }

  await new Promise<void>((resolve) => {
    client.once("clientReady", () => resolve())
  })

  Bun.write(Bun.stderr, "starting TUI...\n")

  await loadTheme()
  const { TUI } = await import("./tui")
  TUI()
}

main().catch((err) => {
  Bun.write(Bun.stderr, `FATAL: ${err}\n`)
  shutdown(1)
})
