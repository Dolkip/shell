import { getGuildMenu } from "../components/guilds"

export function syncGuildSelection(guildId: string) {
    const menu = getGuildMenu()
    if (!menu) return
    const index = menu.options.findIndex((option: any) => option.value === guildId)
    if (index >= 0) {
        menu.setSelectedIndex(index)
    }
}
