import { BoxRenderable, TextRenderable, ScrollBoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"
import { client } from "../discord"
import { getCurrentGuildId } from "../lib/channels"
import { getColour } from "../discord/members"

const STATUS_DOT: Record<string, string | undefined> = {
  online: "#3BA55D",
  idle: "#FAA61A",
  dnd: "#ED4245",
  offline: "#747F8D",
}

function statusColor(member: { presence?: { status?: string | null } | null }): string {
  const s = member.presence?.status
  return (s && STATUS_DOT[s]) ?? STATUS_DOT.offline!
}

export const userListBox = new BoxRenderable(renderer, {
  id: "user-list",
  width: 30,
  flexShrink: 0,
  flexDirection: "column",
})

const memberScroll = new ScrollBoxRenderable(renderer, {
  id: "user-list-scroll",
  width: "100%",
  flexGrow: 1,
  minHeight: 0,
})

userListBox.add(memberScroll)

export function refreshUserList() {
  for (const child of memberScroll.getChildren()) {
    memberScroll.remove(child.id)
  }

  const guildId = getCurrentGuildId()
  if (!guildId || guildId === "dm") {
    const empty = new TextRenderable(renderer, {
      content: " No server selected",
      fg: theme.dim,
    })
    memberScroll.add(empty)
    return
  }

  const guild = client.guilds.cache.get(guildId)
  if (!guild) return

  const members = Array.from(guild.members.cache.values())
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  for (const member of members) {
    const dotColor = statusColor(member)
    const roleColor = getColour(member)

    const row = new BoxRenderable(renderer, {
      width: "100%",
      height: 1,
      flexDirection: "row",
      alignItems: "center",
    })

    const dot = new TextRenderable(renderer, {
      content: "● ",
      fg: dotColor,
    })

    const name = new TextRenderable(renderer, {
      content: member.displayName,
      fg: roleColor,
      flexGrow: 1,
    })

    row.add(dot)
    row.add(name)
    memberScroll.add(row)
  }
}
