import { GuildMember } from "discord.js"

export function getColour(member?: GuildMember, defaultColour = "#FFFFFF"): string {
  if (!member) return defaultColour

  const role = member.roles.cache
    .filter(r => r.color && r.position > 0)
    .sort((a, b) => b.position - a.position)
    .first()

  return role?.hexColor ?? defaultColour
}