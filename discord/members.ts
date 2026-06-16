import { GuildMember } from "discord.js"
import { RGBA } from "@opentui/core"

export function getColour(member?: GuildMember, defaultColour: string | RGBA = "#FFFFFF"): string | RGBA {
  if (!member) return defaultColour

  const role = member.roles.cache
    .filter(r => r.colors.primaryColor && r.position > 0)
    .sort((a, b) => b.position - a.position)
    .first()

  return role?.hexColor ?? defaultColour
}

export function getName(member: GuildMember): string {
  if (!member) return "unknown"
  return member.displayName
}