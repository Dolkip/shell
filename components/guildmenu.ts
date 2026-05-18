import { BoxRenderable, TextRenderable, SelectRenderable, TabSelectRenderable, TabSelectRenderableEvents, SelectRenderableEvents, ScrollBoxRenderable, type KeyEvent } from "@opentui/core";
import { renderer } from "../renderer";
import { client } from "../discord"
import { fetchGuild, getGuildChannels } from "../discord";
import { Theme } from "../theme";

let guildTabs: TabSelectRenderable | null = null;
let channelSelect: SelectRenderable | null = null;
let currentGuildId: string | null = null;
let guildIds: string[] = [];
let guildSelectorFocused = false;

export const guildsMenu = new BoxRenderable(renderer, {
    id: "guilds-menu",
    flexDirection: "column",
    width: 30,
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 0,
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
})

async function loadGuildChannels(guildId: string) {
    if (currentGuildId === guildId) return;
    currentGuildId = guildId;

    const guild = await fetchGuild(guildId);
    const channels = await getGuildChannels(guild);

    const channelArray = channels
        .filter(ch => ch.isTextBased())
        .map(ch => ({
            name: "#" + (ch.name ?? ch.id),
            description: ch.id,
            value: ch.id
        }));

    if (channelSelect) {
        guildsMenu.remove(channelSelect);
    }

    if (channelArray.length === 0) {
        channelSelect = null;
        return;
    }

    channelSelect = new SelectRenderable(renderer, {
        options: channelArray,
        width: "100%",
        height: Math.min(channelArray.length + 1, 10),
        textColor: Theme.selectionText,
        backgroundColor: Theme.selectionBackground,
        selectedBackgroundColor: Theme.accent,
        selectedTextColor: Theme.text,
        descriptionColor: Theme.selectionDescription,
    });

    channelSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: any) => {
        console.log("chosen channel:", option.value);
    });

    guildsMenu.add(channelSelect);
}

export async function initGuildSelector(guildIdsList: string[]) {
    guildIds = guildIdsList;

    const tabOptions = guildIds.map(id => ({
        name: id.slice(-4),
        description: id,
        value: id
    }));

    guildTabs = new TabSelectRenderable(renderer, {
        id: "guild-tabs",
        options: tabOptions,
        tabWidth: 8,
        width: 28,
        tabColor: Theme.border,
        activeTabColor: Theme.accent,
        activeTabTextColor: Theme.text,
        tabTextColor: Theme.mutedText,
    });

    guildTabs.on(TabSelectRenderableEvents.TAB_CHANGED, async (index: number, option: any) => {
        await loadGuildChannels(option.value);
    });

    guildTabs.on(TabSelectRenderableEvents.ITEM_SELECTED, async (index: number, option: any) => {
        await loadGuildChannels(option.value);
    });

    guildTabs.on("blur", () => {
        guildSelectorFocused = false;
    });

    guildTabs.on("focus", () => {
        guildSelectorFocused = true;
    });

    guildsMenu.add(guildTabs);

    if (guildIds.length > 0) {
        await loadGuildChannels(guildIds[0]);
    }

    return guildTabs;
}

export function setupGuildKeyHandler() {
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (key.ctrl && key.name === "g") {
            if (!guildSelectorFocused && guildTabs) {
                guildTabs.focus();
                guildSelectorFocused = true;
            } else if (guildSelectorFocused) {
                guildTabs?.blur();
                guildSelectorFocused = false;
            }
        }
    });
}