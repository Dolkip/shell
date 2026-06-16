import { DMChannel, PartialGroupDMChannel, ChannelType, type Channel } from "discord.js"
import { client } from "./client"
import { searchMembers } from "../lib/search"

export async function openDM(userId: string): Promise<DMChannel> {
    return client.users.createDM(userId)
}

export async function restoreDMChannels(ids: string[]): Promise<string[]> {
    const valid: string[] = []
    for (const id of ids) {
        try {
            const ch = await client.channels.fetch(id)
            if (ch?.isDMBased()) valid.push(id)
        } catch {}
    }
    return valid
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

export function getDMChannelLastActivity(channel: Channel): number {
    if (!channel.isDMBased()) return 0
    return channel.lastMessage?.createdTimestamp ?? channel.createdTimestamp ?? 0
}

export function isDMChannel(channelId: string): boolean {
    const channel = client.channels.cache.get(channelId)
    return channel?.isDMBased() ?? false
}

export async function searchUsers(query: string): Promise<Array<{ userId: string; username: string; displayName: string }>> {
    if (!query.trim()) return []

    const results = searchMembers(query)
    const seen = new Set(results.map(r => r.userId))

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

    return results
}
