import { DMChannel, PartialGroupDMChannel, ChannelType, type Channel } from "discord.js"
import { client } from "./client"

export async function openDM(userId: string): Promise<DMChannel> {
    return client.users.createDM(userId)
}

export async function getDMChannels() {
    return Array.from(client.channels.cache.values())
        .filter((ch) => ch.isDMBased() && !ch.partial)
}

export function getDMSenders(channel: Channel): string {
    if (!channel.isDMBased()) return "Unknown"
    if (channel.type === ChannelType.GroupDM) {
        const group = channel as PartialGroupDMChannel
        if (group.name) return group.name
        const recipients = group.recipients?.map((r) => r.username) ?? []
        return recipients.join(", ") || "Group DM"
    }
    const dm = channel as DMChannel
    return dm.recipient?.username ?? dm.recipientId ?? "Unknown"
}

export function findExistingDM(userId: string): DMChannel | undefined {
    return Array.from(client.channels.cache.values()).find(
        (ch): ch is DMChannel =>
            ch.isDMBased() && !ch.partial && ch.type === ChannelType.DM
            && (ch as DMChannel).recipientId === userId
    )
}

export function getDMRecipientStatus(channel: Channel): string {
    if (!channel.isDMBased() || channel.type !== ChannelType.DM) return ""
    const dm = channel as DMChannel
    if (!dm.recipient) return ""
    for (const guild of client.guilds.cache.values()) {
        const member = guild.members.cache.get(dm.recipient.id)
        if (member?.presence?.status) {
            const s = member.presence.status
            if (s === "online") return "● online"
            if (s === "idle") return "◐ idle"
            if (s === "dnd") return "● do not disturb"
            if (s === "offline") return "○ offline"
        }
    }
    return ""
}

export function getDMChannelLastActivity(channel: Channel): number {
    if (!channel.isDMBased()) return 0
    return channel.lastMessage?.createdTimestamp ?? channel.createdTimestamp ?? 0
}

export function isDMChannel(channelId: string): boolean {
    const channel = client.channels.cache.get(channelId)
    return channel?.isDMBased() ?? false
}

export async function searchUsers(query: string): Promise<Array<{ userId: string; username: string; displayName: string }>> {
    if (!query.trim()) return [] as Array<{ userId: string; username: string; displayName: string }>

    const lc = query.toLowerCase()
    const seen = new Set<string>()
    const results: Array<{ userId: string; username: string; displayName: string }> = []

    for (const guild of client.guilds.cache.values()) {
        for (const [, member] of guild.members.cache) {
            if (seen.has(member.id)) continue
            const user = member.user
            const matchNick = member.nickname?.toLowerCase().includes(lc)
            const matchUser = user.username.toLowerCase().includes(lc)
            const matchDisplay = user.globalName?.toLowerCase().includes(lc)
            if (matchNick || matchUser || matchDisplay) {
                seen.add(member.id)
                results.push({
                    userId: member.id,
                    username: user.username,
                    displayName: member.nickname ?? user.globalName ?? user.username,
                })
            }
        }
    }

    if (/^\d{17,19}$/.test(query.trim())) {
        try {
            const user = await client.users.fetch(query.trim())
            if (!seen.has(user.id)) {
                results.unshift({
                    userId: user.id,
                    username: user.username,
                    displayName: user.globalName ?? user.username,
                })
            }
        } catch {}
    }

    return results.sort((a, b) => a.displayName.localeCompare(b.displayName))
}
