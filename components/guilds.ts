import { TabSelectRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { client } from "../discord"
import { theme } from "../theme"

const guildData = Array.from(client.guilds.cache.values());

export const guildMenu = new TabSelectRenderable(renderer, {
    id: "guild-menu",
    width: "100%",
    flexGrow: 1,
    showDescription: false,
    tabWidth: 16,
    backgroundColor: theme.select.base,
    textColor: theme.select.text,
    focusedBackgroundColor: theme.select.focused,
    focusedTextColor: theme.select.focusedText,
    selectedBackgroundColor: theme.select.selected,
    selectedTextColor: theme.select.selectedText,
    selectedDescriptionColor: theme.select.selectedDescription,
    options: [
        {
            name: "Direct",
            description: "",
            value: "dm",
        },
        ...guildData.map(g => ({
            name: g.name,
            description: "",
            value: g.id,
        })),
    ],
})
