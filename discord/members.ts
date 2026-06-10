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

export function getRoles(member?: GuildMember) {
  if (!member) return []
  return member.roles.cache
    .filter(r => r.position > 0)
    .sort((a, b) => b.position - a.position)
    .map(r => r.name)
}