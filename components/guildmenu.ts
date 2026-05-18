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
    width: 30,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
})

const guildNameText = new TextRenderable(renderer, {
    id: "guild-name",
    content: "Select guild",
    fg: Theme.accent,
    attributes: TextAttributes.BOLD,
    flexShrink: 0,
})

guildsMenu.add(guildNameText)

async function loadGuildChannels(guildId: string) {
    if (currentGuildId === guildId) return;
    currentGuildId = guildId;

    const guild = await fetchGuild(guildId);
    guildNameText.content = guild.name.slice(0, 28) || "Unknown"

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
        flexGrow: 1,
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

    if (guildIds.length > 0) {
        await loadGuildChannels(guildIds[0]);
    }
}

export function setupGuildKeyHandler() {
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (key.ctrl && key.name === "g") {
            if (!guildSelectorFocused && channelSelect) {
                channelSelect.focus();
                guildSelectorFocused = true;
            } else if (guildSelectorFocused) {
                channelSelect?.blur();
                guildSelectorFocused = false;
            }
        }
    });
}