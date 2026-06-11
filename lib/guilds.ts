import { TabSelectRenderable, TabSelectRenderableEvents } from "@opentui/core";
import { renderer } from "../renderer";
import { client } from "../discord"
import { theme } from "../theme"
import { guildMenuContainer } from "../components/guilds"

let _menu: TabSelectRenderable | null = null
let _onItemSelected: ((index: number, option: any) => void) | null = null

function buildOptions() {
    const guildData = Array.from(client.guilds.cache.values());
    return [
        { name: "Direct", description: "", value: "dm" },
        ...guildData.map(g => ({ name: g.name, description: "", value: g.id })),
    ]
}

export function getGuildMenu(): TabSelectRenderable | null {
    return _menu
}

export function setOnGuildItemSelected(handler: (index: number, option: any) => void) {
    _onItemSelected = handler
    if (_menu) {
        _menu.removeAllListeners(TabSelectRenderableEvents.ITEM_SELECTED)
        _menu.on(TabSelectRenderableEvents.ITEM_SELECTED, _onItemSelected)
    }
}

function rebuildMenu() {
    for (const child of guildMenuContainer.getChildren()) {
        guildMenuContainer.remove(child.id)
    }
    if (_menu) {
        _menu.destroy()
        _menu = null
    }

    _menu = new TabSelectRenderable(renderer, {
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
        options: buildOptions(),
    })
    if (_onItemSelected) {
        _menu.on(TabSelectRenderableEvents.ITEM_SELECTED, _onItemSelected)
    }

    guildMenuContainer.add(_menu)
}

export function refreshGuilds() {
    rebuildMenu()
}

export function ensureGuildMenu() {
    if (!_menu) rebuildMenu()
}

export function syncGuildSelection(guildId: string) {
    const menu = getGuildMenu()
    if (!menu) return
    const index = menu.options.findIndex((option: any) => option.value === guildId)
    if (index >= 0) {
        menu.setSelectedIndex(index)
    }
}
