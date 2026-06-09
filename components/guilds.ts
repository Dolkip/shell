import { TabSelectRenderable, TabSelectRenderableEvents, type TabSelectOption } from "@opentui/core";
import { renderer } from "../renderer";
import { client } from "../discord"
import { loadGuildChannels } from "./channels"
import { Theme } from "../theme"

const guildData = Array.from(client.guilds.cache.values());

export const guildMenu = new TabSelectRenderable(renderer, {
    id: "guild-menu",
    width: "100%",
    flexGrow: 1,
    showDescription: false,
    tabWidth: 16,
    backgroundColor: Theme.select.base,
    textColor: Theme.select.text,
    focusedBackgroundColor: Theme.select.focused,
    focusedTextColor: Theme.select.focusedText,
    selectedBackgroundColor: Theme.select.selected,
    selectedTextColor: Theme.select.selectedText,
    selectedDescriptionColor: Theme.select.selectedDescription,
    options: guildData.map(g => ({
        name: g.name,
        description: "",
        value: g.id,
    })),
})

guildMenu.on(TabSelectRenderableEvents.ITEM_SELECTED, (index: number, option: TabSelectOption) => {
    if (option.value) {
        loadGuildChannels(option.value as string);
    }
});

