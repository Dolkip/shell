import { client } from "./discord"
import kleur from "kleur"
import { ensureDirectories, loadConfig, loadState, saveState, state, config } from "./config"
import { restoreDMChannels } from "./discord/dms"
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

  const token = config.token
  if (!token) {
    console.error("No Discord token configured. Set token in ~/.shell/config.toml")
    shutdown(1)
  }

  try {
    await client.login(token)
  } catch (e) {
    console.error(`Failed to login: ${e}`)
    shutdown(1)
  }

  await new Promise<void>((resolve) => {
    client.once("clientReady", () => resolve())
  })

  if (state.dmChannels.length > 0) {
    const valid = await restoreDMChannels(state.dmChannels)
    if (valid.length !== state.dmChannels.length) {
      state.dmChannels = valid
      await saveState()
    }
  }

  console.log("starting TUI...")

  await loadTheme()
  const { TUI } = await import("./tui")
  await TUI()
}

main().catch((err) => {
  console.error(err)
  shutdown(1)
})
