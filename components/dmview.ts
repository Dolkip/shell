import { BoxRenderable, TextRenderable, InputRenderable, SelectRenderable, SelectRenderableEvents, InputRenderableEvents, type SelectOption } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"
import { searchUsers, openDM } from "../discord/dms"

const dmResults = new BoxRenderable(renderer, {
    id: "dm-results",
    width: "100%",
    flexGrow: 1,
    flexDirection: "column",
})

let resultsSelect: SelectRenderable | null = null
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let onDmCreated: ((channelId: string) => void) | null = null

export function setOnDmCreated(handler: (channelId: string) => void) {
    onDmCreated = handler
}

export const dmBox = new BoxRenderable(renderer, {
    id: "dm-box",
    width: "100%",
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    flexDirection: "column",
})

export const dmSearchBox = new InputRenderable(renderer, {
    id: "dm-search-box",
    width: "100%",
    backgroundColor: theme.input.base,
    focusedBackgroundColor: theme.input.focused,
    textColor: theme.input.text,
    focusedTextColor: theme.input.focusedText,
    cursorColor: theme.input.cursor,
    placeholderColor: theme.input.placeholder,
    placeholder: "Search shared guilds or paste a user ID...",
})

dmSearchBox.on(InputRenderableEvents.INPUT, (value: string) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (!value.trim()) {
        clearResults()
        return
    }
    searchTimeout = setTimeout(async () => {
        const results = await searchUsers(value)
        updateResults(results)
    }, 200)
})

dmSearchBox.on(InputRenderableEvents.ENTER, async (value: string) => {
    if (!value.trim()) return
    if (resultsSelect && resultsSelect.getSelectedOption()) {
        const option = resultsSelect.getSelectedOption()
        if (option && typeof option.value === "string") {
            try {
                const dm = await openDM(option.value)
                clearResults()
                onDmCreated?.(dm.id)
            } catch {}
        }
    } else {
        try {
            const dm = await openDM(value.trim())
            clearResults()
            onDmCreated?.(dm.id)
        } catch {}
    }
})

function clearResults() {
    if (resultsSelect) {
        resultsSelect.destroy()
        resultsSelect = null
    }
    for (const child of dmResults.getChildren()) {
        dmResults.remove(child.id)
    }
}

async function updateResults(users: Array<{ userId: string; username: string; displayName: string }>) {
    for (const child of dmResults.getChildren()) {
        dmResults.remove(child.id)
    }
    if (resultsSelect) {
        resultsSelect.destroy()
        resultsSelect = null
    }

    if (users.length === 0) {
        const hint = new TextRenderable(renderer, {
            content: "No users found in shared guilds. Paste a user ID and press Enter to DM anyone.",
            fg: theme.dim,
        })
        dmResults.add(hint)
        return
    }

    const options: SelectOption[] = users.map((u) => ({
        name: `${u.displayName}`,
        description: `@${u.username}`,
        value: u.userId,
    }))

    resultsSelect = new SelectRenderable(renderer, {
        id: "dm-user-select",
        options,
        selectedIndex: 0,
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
        showDescription: true,
    })

    resultsSelect.on(SelectRenderableEvents.ITEM_SELECTED, async (_index: number, option: SelectOption) => {
        if (typeof option.value === "string") {
            try {
                const dm = await openDM(option.value)
                clearResults()
                onDmCreated?.(dm.id)
            } catch {}
        }
    })

    dmResults.add(resultsSelect)
}

dmBox.add(dmSearchBox)
dmBox.add(dmResults)

export function resetDmView() {
    dmSearchBox.value = ""
    clearResults()
}

export function isDmViewActive(): boolean {
    return renderer.root.findDescendantById("dm-box") !== null
}

export function getDmSelectedUserId(): string | null {
    if (!resultsSelect) return null
    const option = resultsSelect.getSelectedOption()
    return option && typeof option.value === "string" ? option.value : null
}

export function selectNextResult(): boolean {
    if (!resultsSelect) return false
    const options = resultsSelect.options
    if (!options || options.length === 0) return false
    const current = resultsSelect.selectedIndex ?? 0
    if (current < options.length - 1) {
        resultsSelect.setSelectedIndex(current + 1)
        return true
    }
    return false
}

export function selectPrevResult(): boolean {
    if (!resultsSelect) return false
    const current = resultsSelect.selectedIndex ?? 0
    if (current > 0) {
        resultsSelect.setSelectedIndex(current - 1)
        return true
    }
    return false
}
