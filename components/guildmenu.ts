import { BoxRenderable, TextRenderable, SelectRenderable, SelectRenderableEvents, TextAttributes, type KeyEvent } from "@opentui/core";
import { renderer } from "../renderer";
import { fetchGuild, getGuildChannels } from "../discord";
import { Theme } from "../theme";

let channelSelect: SelectRenderable | null = null;
let currentGuildId: string | null = null;
let guildIds: string[] = [];
let guildSelectorFocused = false;

export const guildsMenu = new BoxRenderable(renderer, {
    id: "guilds-menu",
    flexDirection: "column",
    width: 35,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
})

const guildNameBox = new BoxRenderable(renderer, {
    id: "guild-name-box",
    width: "100%",
    backgroundColor: Theme.selectionBackground,
})

const guildNameText = new TextRenderable(renderer, {
    id: "guild-name",
    content: "guild",
    fg: Theme.accent,
    attributes: TextAttributes.BOLD,
})

guildNameBox.add(guildNameText)
guildsMenu.add(guildNameBox)

async function loadGuildChannels(guildId: string) {
    if (currentGuildId === guildId) return;
    currentGuildId = guildId;

    const guild = await fetchGuild(guildId);
    guildNameText.content = guild.name.slice(0, 32) || "Unknown";

    const channels = await getGuildChannels(guild);

    const channelArray = channels
        .filter(ch => ch.isTextBased())
        .map(ch => ({
            name: "#" + (ch.name ?? ch.id).slice(0, 16),
            description: ch.id,
            value: ch.id
        }));

    if (channelSelect) {
        channelSelect.destroy();
        channelSelect = null;
    }

    if (channelArray.length === 0) {
        channelSelect = null;
        return;
    }

    channelSelect = new SelectRenderable(renderer, {
        options: channelArray,
        width: "100%",
        flexGrow: 1,
        textColor: Theme.selectionText,
        backgroundColor: Theme.selectionBackground,
        selectedBackgroundColor: Theme.accent,
        selectedTextColor: Theme.text,
        showDescription: false,
    });

    channelSelect.on(SelectRenderableEvents.ITEM_SELECTED, (index: number, option: any) => {
        console.log("chosen channel:", option.value);
    });

    guildsMenu.add(channelSelect);
}

export async function initGuildSelector(guildIdsList: string[]) {
    guildIds = guildIdsList;

    if (guildIds.length > 0) {
        await loadGuildChannels(guildIds[0]!);
    }
}

let channelSelectFocused = false;

export function setupGuildKeyHandler() {
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (!guildSelectorFocused) return;

        if (key.ctrl && key.name === "tab") {
            guildSelectorFocused = false;
            channelSelectFocused = false;
            channelSelect?.blur();
            return;
        }

        if (key.name === "left") {
            const currentIndex = guildIds.indexOf(currentGuildId ?? "");
            if (currentIndex > 0) {
                loadGuildChannels(guildIds[currentIndex - 1]!);
            }
        } else if (key.name === "right") {
            const currentIndex = guildIds.indexOf(currentGuildId ?? "");
            if (currentIndex < guildIds.length - 1) {
                loadGuildChannels(guildIds[currentIndex + 1]!);
            }
        } else if (key.name === "up" || key.name === "down") {
            channelSelect?.focus();
            channelSelectFocused = true;
        }
    });
}

export function setGuildSelectorFocused(focused: boolean) {
    guildSelectorFocused = focused;
    if (focused) {
        channelSelect?.focus();
        channelSelectFocused = true;
    } else {
        channelSelect?.blur();
        channelSelectFocused = false;
    }
}