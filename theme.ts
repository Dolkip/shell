import { Glob } from "bun"
import { RGBA } from "@opentui/core"
import config from "./config.toml" with { type: "toml" }

export type theme = Record<string, RGBA>

const themes = new Glob("themes/*.json")

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

export async function loadTheme(): Promise<theme> {
    const themePath = `themes/${config.theme}.json`

    if (!themes.match(themePath)) {
        const availableThemes = Array.from(themes.scanSync(".")).sort()
        throw new Error(
            `Theme "${config.theme}" was not found. Available themes: ${availableThemes.join(", ") || "(none)"}`,
        )
    }

    const rawTheme = await Bun.file(themePath).json()

    if (!isPlainObject(rawTheme)) {
        throw new Error(`Theme file "${themePath}" must contain a JSON object`)
    }

    const theme: theme = {}

    for (const [key, value] of Object.entries(rawTheme)) {
        if (!isString(value)) {
            throw new Error(`Theme color "${key}" in "${themePath}" must be a string`)
        }

        const color = Bun.color(value)

        if (color === null) {
            throw new Error(`Theme color "${key}" in "${themePath}" is not a valid color: ${value}`)
        }

        theme[key] = RGBA.fromHex(color)
    }

    return theme
}

export const Theme = await loadTheme()