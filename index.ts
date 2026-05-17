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

  await client.login(config.token)

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