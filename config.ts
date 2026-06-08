import { join } from "node:path"
import { homedir } from "node:os"
import { Glob } from "bun"
import { mkdir, access } from "node:fs/promises"

export const SHELLDIR = join(homedir(), ".shell")
const THEMES_DIR = join(SHELLDIR, "themes")
export const STATE_PATH = join(SHELLDIR, "state.json")

export interface Config {
    theme: string
    chunkSize: number
    discord: {
        token: string
        id: string
    }
}

export interface State {
    theme?: string
    lastChannel?: string
}

export let config: Config = {
    theme: "shell",
    chunkSize: 50,
    discord: { token: "", id: "" },
}
export let state: State = {}

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v)
}

function isString(v: unknown): v is string {
    return typeof v === "string"
}

function isNumber(v: unknown): v is number {
    return typeof v === "number"
}

const DEFAULT_CONFIG_TOML = `theme = "shell"
chunkSize = 50

[discord]
token = ""
id = ""
`

const SHELL_JSON = JSON.stringify({
    background: "#000000",
    accent: "#5865F2",
    text: "#FFFFFF",
    mutedText: "#888888",
    border: "#FFFFFF",
    panelBackground: "#111111",
    panelBackgroundAlt: "#1a1a1a",
    inputBackground: "#1a1a1a",
    inputFocusedBackground: "#444444",
    inputText: "#FFFFFF",
    inputCursor: "#5865F2",
    selectionBackground: "#1a1a1a",
    selectionText: "#FFFFFF",
    selectionDescription: "#AAAAAA"
}, null, 4)

async function fileExists(p: string): Promise<boolean> {
    try {
        await access(p)
        return true
    } catch {
        return false
    }
}

export async function ensureDirectories(): Promise<void> {
    await mkdir(SHELLDIR, { recursive: true })
    await mkdir(THEMES_DIR, { recursive: true })

    if (!(await fileExists(join(SHELLDIR, "config.toml")))) {
        await Bun.write(join(SHELLDIR, "config.toml"), DEFAULT_CONFIG_TOML)
    }

    const themes = Array.from(new Glob("*.json").scanSync(THEMES_DIR))
    if (themes.length === 0) {
        await Bun.write(join(THEMES_DIR, "shell.json"), SHELL_JSON)
    }
}

export async function loadConfig(): Promise<void> {
    const mod = await import(join(SHELLDIR, "config.toml"), { with: { type: "toml" } }) as Record<string, unknown>
    const raw = (mod.default ?? mod) as Record<string, unknown>

    if (!isPlainObject(raw)) throw new Error("config.toml must be a table")
    if (!isString(raw.theme)) throw new Error(`config.toml: theme (${typeof raw.theme}) must be a string`)
    if (!isNumber(raw.chunkSize)) throw new Error(`config.toml: chunkSize (${typeof raw.chunkSize}) must be a number`)

    const discord = raw.discord
    if (!isPlainObject(discord)) throw new Error("config.toml: [discord] section required")
    if (!isString(discord.token)) throw new Error(`config.toml: discord.token (${typeof discord.token}) must be a string — make sure it is wrapped in double quotes`)
    if (!isString(discord.id)) throw new Error(`config.toml: discord.id (${typeof discord.id}) must be a string`)

    config = raw as unknown as Config
}

export async function loadState(): Promise<void> {
    try {
        const raw = await Bun.file(STATE_PATH).json()
        state = isPlainObject(raw) ? raw as State : {}
    } catch {
        state = {}
    }
}

export async function saveState(): Promise<void> {
    await Bun.write(STATE_PATH, JSON.stringify(state, null, 2))
}
