import { SelectRenderable, SelectRenderableEvents, type KeyEvent, type SelectOption } from "@opentui/core";
import { renderer } from "../renderer";
import { fetchGuild, getGuildChannels } from "../discord";
import { theme } from "../theme";
import { channelMenu } from "../components/channels"

interface ChannelOption extends SelectOption {
    value: string
}

let channelSelect: SelectRenderable | null = null;
let currentGuildId: string | null = null;
let channelOptions: ChannelOption[] = [];

export let onChannelSelect: ((channelId: string) => void) | null = null;

export function setOnChannelSelect(handler: (channelId: string) => void) {
    onChannelSelect = handler;
}

function selectedChannelId(): string | null {
    const option = channelSelect?.getSelectedOption()
    return typeof option?.value === "string" ? option.value : null
}

export function selectChannel(channelId: string) {
    if (!channelId) return
    onChannelSelect?.(channelId)
}

export async function loadGuildChannels(guildId: string, preferredChannelId?: string): Promise<string | null> {
    if (currentGuildId === guildId && channelOptions.length > 0) {
        const selected = preferredChannelId && channelOptions.some((option) => option.value === preferredChannelId)
            ? preferredChannelId
            : selectedChannelId() ?? channelOptions[0]?.value ?? null
        if (selected) syncChannelSelection(selected)
        return selected
    }

    currentGuildId = guildId;

    const guild = await fetchGuild(guildId);

    const channels = await getGuildChannels(guild);

    channelOptions = channels
        .filter(ch => ch.isTextBased())
        .map(ch => ({
            name: "#" + ch.name,
            description: ch.id,
            value: ch.id,
        }));

    if (channelSelect) {
        channelSelect.destroy();
        channelSelect = null;
    }

    if (channelOptions.length === 0) {
        return null;
    }

    const selectedIndex = Math.max(
        0,
        preferredChannelId
            ? channelOptions.findIndex((option) => option.value === preferredChannelId)
            : 0,
    )

    channelSelect = new SelectRenderable(renderer, {
        id: "channel-select",
        options: channelOptions,
        selectedIndex,
        width: "100%",
        flexGrow: 1,
        textColor: theme.select.text,
        backgroundColor: theme.select.base,
        focusedBackgroundColor: theme.select.focused,
        focusedTextColor: theme.select.focusedText,
        selectedBackgroundColor: theme.select.selected,
        selectedTextColor: theme.select.selectedText,
        descriptionColor: theme.select.description,
        selectedDescriptionColor: theme.select.selectedDescription,
        showDescription: false,
    });

    channelSelect.on(SelectRenderableEvents.ITEM_SELECTED, (_index: number, option: SelectOption) => {
        if (typeof option.value === "string") {
            selectChannel(option.value);
        }
    });

    channelMenu.add(channelSelect);
    return channelOptions[selectedIndex]?.value ?? null
}

export function syncChannelSelection(channelId: string) {
    if (!channelSelect) return;
    const idx = channelOptions.findIndex((option) => option.value === channelId);
    if (idx >= 0) {
        channelSelect.setSelectedIndex(idx);
    }
}

export async function initGuildSelector(guildIdsList: string[], targetGuildId?: string, targetChannelId?: string) {
    if (guildIdsList.length === 0) return null

    const guildId = targetGuildId && guildIdsList.includes(targetGuildId)
        ? targetGuildId
        : guildIdsList[0]!;

    return loadGuildChannels(guildId, targetChannelId);
}

export function setupGuildKeyHandler() {
    renderer.keyInput.on("keypress", (key: KeyEvent) => {
        if (!channelSelect) return;

        if (key.ctrl && key.name === "tab") {
            channelSelect.blur();
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
