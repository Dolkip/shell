import { join } from "node:path"
import { Glob, JSON5 } from "bun"
import { RGBA } from "@opentui/core"
import { config, SHELLDIR } from "./config"

export interface Theme {
    meta: {
        name: string
        description: string
    }
    background: RGBA
    text: RGBA
    dim: RGBA
    accent: RGBA
    border: RGBA
    message: {
        base: RGBA
        hover: RGBA
        text: RGBA
    }
    input: {
        base: RGBA
        focused: RGBA
        text: RGBA
        focusedText: RGBA
        cursor: RGBA
        placeholder: RGBA
        selectionBg: RGBA
        selectionFg: RGBA
    }
    select: {
        base: RGBA
        focused: RGBA
        text: RGBA
        focusedText: RGBA
        selected: RGBA
        selectedText: RGBA
        description: RGBA
        selectedDescription: RGBA
    }
    panel: {
        base: RGBA
        alt: RGBA
    }
    scrollbar: {
        track: RGBA
        thumb: RGBA
    }
}

const THEMES_DIR = join(SHELLDIR, "themes")
const themes = new Glob("*.json")

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
    return typeof value === "string"
}

function parseColor(value: unknown, path: string): RGBA {
    if (!isString(value)) {
        throw new Error(`Theme color "${path}" must be a string, got ${typeof value}`)
    }
    const hex = Bun.color(value)
    if (hex === null) {
        throw new Error(`Theme color "${path}" is not a valid color: ${value}`)
    }
    return RGBA.fromHex(hex)
}

function parseOptionalColor(value: unknown, path: string): RGBA | undefined {
    if (value === undefined) return undefined
    return parseColor(value, path)
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

    const raw = JSON5.parse(await Bun.file(themePath).text())

    if (!isPlainObject(raw)) {
        throw new Error(`Theme file "${themePath}" must contain a JSON object`)
    }

    const metaRaw = isPlainObject(raw.meta) ? raw.meta : {}
    const msg = isPlainObject(raw.message) ? raw.message : {}
    const inp = isPlainObject(raw.input) ? raw.input : {}
    const sel = isPlainObject(raw.select) ? raw.select : {}
    const pnl = isPlainObject(raw.panel) ? raw.panel : {}
    const scl = isPlainObject(raw.scrollbar) ? raw.scrollbar : {}

    const background = parseColor(raw.background ?? "#000000", "background")
    const text = parseColor(raw.text ?? "#ffffff", "text")
    const dim = parseColor(raw.dim ?? "#888888", "dim")
    const accent = parseColor(raw.accent ?? "#5865F2", "accent")

    Theme = {
        meta: {
            name: isString(metaRaw.name) ? metaRaw.name : config.theme,
            description: isString(metaRaw.description) ? metaRaw.description : "",
        },
        background,
        text,
        dim,
        accent,
        border: parseOptionalColor(raw.border, "border") ?? text,
        message: {
            base: parseOptionalColor(msg.base, "message.base") ?? background,
            hover: parseOptionalColor(msg.hover, "message.hover") ?? background,
            text: parseOptionalColor(msg.text, "message.text") ?? text,
        },
        input: {
            base: parseOptionalColor(inp.base, "input.base") ?? background,
            focused: parseOptionalColor(inp.focused, "input.focused") ?? accent,
            text: parseOptionalColor(inp.text, "input.text") ?? text,
            focusedText: parseOptionalColor(inp.focusedText, "input.focusedText") ?? text,
            cursor: parseOptionalColor(inp.cursor, "input.cursor") ?? accent,
            placeholder: parseOptionalColor(inp.placeholder, "input.placeholder") ?? dim,
            selectionBg: parseOptionalColor(inp.selectionBg, "input.selectionBg") ?? accent,
            selectionFg: parseOptionalColor(inp.selectionFg, "input.selectionFg") ?? text,
        },
        select: {
            base: parseOptionalColor(sel.base, "select.base") ?? background,
            focused: parseOptionalColor(sel.focused, "select.focused") ?? background,
            text: parseOptionalColor(sel.text, "select.text") ?? text,
            focusedText: parseOptionalColor(sel.focusedText, "select.focusedText") ?? text,
            selected: parseOptionalColor(sel.selected, "select.selected") ?? accent,
            selectedText: parseOptionalColor(sel.selectedText, "select.selectedText") ?? text,
            description: parseOptionalColor(sel.description, "select.description") ?? dim,
            selectedDescription: parseOptionalColor(sel.selectedDescription, "select.selectedDescription") ?? text,
        },
        panel: {
            base: parseOptionalColor(pnl.base, "panel.base") ?? background,
            alt: parseOptionalColor(pnl.alt, "panel.alt") ?? background,
        },
        scrollbar: {
            track: parseOptionalColor(scl.track, "scrollbar.track") ?? dim,
            thumb: parseOptionalColor(scl.thumb, "scrollbar.thumb") ?? accent,
        },
    }
}

export let Theme: Theme
