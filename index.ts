import { client } from "./discord"
import { startTUI } from "./tui"

async function main() {
  console.log("logging into discord...")

  await client.login(process.env.TOKEN)

  await new Promise<void>((resolve) => {
    client.once("ready", resolve)
  })

  console.log("discord ready → starting TUI")

  startTUI()
}

main()