import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { banner } from "../components/banner"
import { guildMenuContainer } from "../components/guilds"
import { channelMenu } from "../components/channels"
import { channelHeader } from "../components/channeldisplay"
import { chatBox } from "../components/chat"
import { messageBox } from "../components/messagebox"

export const contentArea = new BoxRenderable(renderer, {
  id: "content-area",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  flexDirection: "column",
})

contentArea.add(channelHeader)
contentArea.add(chatBox)
contentArea.add(messageBox)

export const main = new BoxRenderable(renderer, {
  id: "main",
  width: "100%",
  height: "100%",
  flexGrow: 1,
  flexShrink: 1,
  minHeight: 0,
  flexDirection: "row",
})

main.add(channelMenu)
main.add(contentArea)

export function buildApp(): BoxRenderable {
  const app = new BoxRenderable(renderer, {
    id: "app",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    flexGrow: 1,
  })

  app.add(banner)
  app.add(guildMenuContainer)
  app.add(main)

  return app
}
