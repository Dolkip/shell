import { BoxRenderable, TextRenderable, SelectRenderable, SelectRenderableEvents, TextAttributes, type KeyEvent } from "@opentui/core";
import { renderer } from "../renderer";
import { fetchGuild, getGuildChannels } from "../discord";
import { Theme } from "../theme";

let channelSelect: SelectRenderable | null = null;
let currentGuildId: string | null = null;
let guildIds: string[] = [];

export let onChannelSelect: ((channelId: string) => void) | null = null;

export function setOnChannelSelect(handler: (channelId: string) => void) {
    onChannelSelect = handler;
}

export const channelMenu = new BoxRenderable(renderer, {
    id: "guilds-menu",
    flexDirection: "column",
    width: 35,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
})

export const guildNameText = new TextRenderable(renderer, {
    id: "guild-name",
    content: "",
})

channelMenu.add(guildNameText)

export async function loadGuildChannels(guildId: string) {
    if (currentGuildId === guildId) return;
    currentGuildId = guildId;

    const guild = await fetchGuild(guildId);
    guildNameText.content = guild.name || "Unknown";

    const channels = await getGuildChannels(guild);

    const channelArray = channels
        .filter(ch => ch.isTextBased())
        .map(ch => ({
            name: "#" + ch.name,
            description: ch.id,
            value: ch.id
        }));

    if (channelSelect) {
        channelSelect.destroy();
        channelSelect = null;
    }

    if (channelArray.length === 0) {
        return;
    }

    channelSelect = new SelectRenderable(renderer, {
        id: "channel-select",
        options: channelArray,
        width: "100%",
        flexGrow: 1,
        textColor: Theme.select.text,
        backgroundColor: Theme.select.base,
        focusedBackgroundColor: Theme.select.focused,
        focusedTextColor: Theme.select.focusedText,
        selectedBackgroundColor: Theme.select.selected,
        selectedTextColor: Theme.select.selectedText,
        descriptionColor: Theme.select.description,
        selectedDescriptionColor: Theme.select.selectedDescription,
        showDescription: false,
    });

    channelSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: any) => {
        if (onChannelSelect) {
            onChannelSelect(option.value);
        }
    });

    channelMenu.add(channelSelect);
}

export function syncChannelSelection(channelId: string) {
    if (!channelSelect) return;
    const options = channelSelect.options;
    const idx = options.findIndex((o: any) => o.value === channelId);
    if (idx >= 0) {
        channelSelect.setSelectedIndex(idx);
    }
}

export async function initGuildSelector(guildIdsList: string[], targetGuildId?: string) {
    guildIds = guildIdsList;

    if (guildIds.length > 0) {
        const guildId = targetGuildId && guildIdsList.includes(targetGuildId)
            ? targetGuildId
            : guildIds[0]!;
        await loadGuildChannels(guildId);
    }
}

export function setupGuildKeyHandler() {
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (!channelSelect) return;

        if (key.ctrl && key.name === "tab") {
            channelSelect.blur();
            return;
        } 
        if ((key.name === "up" || key.name === "down") && channelSelect.focused) {
            channelSelect.focus();
        }
    });
}

export function setGuildSelectorFocused(focused: boolean) {
    if (focused) {
        channelSelect?.focus();
    } else {
        channelSelect?.blur();
    }
}
