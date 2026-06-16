import { BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { banner } from "../components/banner"
import { guildMenuContainer } from "../components/guilds"
import { channelMenu } from "../components/channels"
import { channelBox } from "../components/channelbox"

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
main.add(channelBox)

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
