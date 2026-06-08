import { join } from "node:path"
import { Glob } from "bun"
import { RGBA } from "@opentui/core"
import { config, SHELLDIR } from "./config"

export interface theme {
    background: RGBA
    accent: RGBA
    text: RGBA
    mutedText: RGBA
    border: RGBA
    panelBackground: RGBA
    panelBackgroundAlt: RGBA
    inputBackground: RGBA
    inputFocusedBackground: RGBA
    inputText: RGBA
    inputCursor: RGBA
    selectionBackground: RGBA
    selectionText: RGBA
    selectionDescription: RGBA
    [key: string]: RGBA
}

const THEMES_DIR = join(SHELLDIR, "themes")
const themes = new Glob("*.json")

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

export async function loadTheme(): Promise<void> {
    const themeFile = `${config.theme}.json`
    const themePath = join(THEMES_DIR, themeFile)

    if (!themes.match(themeFile)) {
        const availableThemes = Array.from(themes.scanSync(THEMES_DIR)).sort()
        throw new Error(
            `Theme "${config.theme}" was not found. Available themes: ${availableThemes.join(", ") || "(none)"}`,
        )
    }

    const rawTheme = await Bun.file(themePath).json()

    if (!isPlainObject(rawTheme)) {
        throw new Error(`Theme file "${themePath}" must contain a JSON object`)
    }

    const t = {} as theme

    for (const [key, value] of Object.entries(rawTheme)) {
        if (!isString(value)) {
            throw new Error(`Theme color "${key}" in "${themePath}" must be a string`)
        }

        const color = Bun.color(value)

        if (color === null) {
            throw new Error(`Theme color "${key}" in "${themePath}" is not a valid color: ${value}`)
        }

        t[key] = RGBA.fromHex(color)
    }

    Theme = t
}

export let Theme: theme
