import { guildMenu } from "../components/guilds"

export function syncGuildSelection(guildId: string) {
    const index = guildMenu.options.findIndex((option) => option.value === guildId)
    if (index >= 0) {
        guildMenu.setSelectedIndex(index)
    }
}
