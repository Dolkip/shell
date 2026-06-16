import { client } from "../discord/client"

export interface MemberResult {
  userId: string
  username: string
  displayName: string
}

export function searchMembers(query: string, guildId?: string): MemberResult[] {
  if (!query.trim()) return []

  const lc = query.toLowerCase()
  const seen = new Set<string>()
  const results: MemberResult[] = []

  const guilds = guildId
    ? [client.guilds.cache.get(guildId)].filter(Boolean) as NonNullable<ReturnType<typeof client.guilds.cache.get>>[]
    : [...client.guilds.cache.values()]

  for (const guild of guilds) {
    for (const [, member] of guild.members.cache) {
      if (seen.has(member.id)) continue
      const user = member.user
      if (
        member.nickname?.toLowerCase().includes(lc) ||
        user.username.toLowerCase().includes(lc) ||
        user.globalName?.toLowerCase().includes(lc)
      ) {
        seen.add(member.id)
        results.push({
          userId: member.id,
          username: user.username,
          displayName: member.nickname ?? user.globalName ?? user.username,
        })
      }
    }
  }

  return results.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
