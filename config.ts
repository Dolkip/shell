import { join } from "node:path"
import { homedir } from "node:os"
import { Glob } from "bun"
import { mkdir, access, readdir, copyFile, writeFile } from "node:fs/promises"

export const SHELLDIR = join(homedir(), ".shell")
const THEMES_DIR = join(SHELLDIR, "themes")
const EXAMPLES = join(import.meta.dir, "examples")
const STATE_PATH = join(SHELLDIR, "state.json")

export interface Config {
    theme: string
    chunkSize: number
    token: string
    id: string
    discord: {
        token: string
        id: string
    }
}

export interface State {
    theme: string
    currentChannelId: string
}

export let config: Config = {
    theme: "shell",
    chunkSize: 50,
    token: "",
    id: "",
    discord: { token: "", id: "" },
}

export let state: State = {
    theme: "shell",
    currentChannelId: "",
}

export let currentChannelId = ""

export function setCurrentChannelId(id: string) {
    currentChannelId = id
    state = { ...state, currentChannelId: id }
    void saveState().catch((error) => {
        console.error("Failed to save Shell state:", error)
    })
}

export function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v)
}

export function isString(v: unknown): v is string {
    return typeof v === "string"
}

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
        await copyFile(join(EXAMPLES, "config.toml"), join(SHELLDIR, "config.toml"))
    }

    if (!(await fileExists(STATE_PATH))) {
        await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + "\n")
    }

    const themes = Array.from(new Glob("*.json").scanSync(THEMES_DIR))
    if (themes.length === 0) {
        const themeFiles = await readdir(join(EXAMPLES, "themes"))
        for (const file of themeFiles) {
            await copyFile(join(EXAMPLES, "themes", file), join(THEMES_DIR, file))
        }
    }
}

function readString(raw: Record<string, unknown>, key: string, label = key): string {
    const value = raw[key]
    if (value === undefined) return ""
    if (!isString(value)) throw new Error(`config.toml: ${label} (${typeof value}) must be a string`)
    return value
}

export async function loadConfig(): Promise<void> {
    const mod = await import(join(SHELLDIR, "config.toml"), { with: { type: "toml" } }) as Record<string, unknown>
    const raw = (mod.default ?? mod) as Record<string, unknown>

    if (!isPlainObject(raw)) throw new Error("config.toml must be a table")
    if (!isString(raw.theme)) throw new Error(`config.toml: theme (${typeof raw.theme}) must be a string`)
    if (typeof raw.chunkSize !== "number") throw new Error(`config.toml: chunkSize (${typeof raw.chunkSize}) must be a number`)

    const discord = isPlainObject(raw.discord) ? raw.discord : {}
    const token = readString(raw, "token") || readString(discord, "token", "discord.token")
    const id = readString(raw, "id") || readString(discord, "id", "discord.id")

    config = {
        theme: raw.theme,
        chunkSize: raw.chunkSize,
        token,
        id,
        discord: { token, id },
    }
}


export async function loadState(): Promise<void> {
    const raw = JSON.parse(await Bun.file(STATE_PATH).text())

    if (!isPlainObject(raw)) throw new Error("state.json must contain a JSON object")

    state = {
        theme: config.theme,
        currentChannelId: isString(raw.currentChannelId) ? raw.currentChannelId : "",
    }

    currentChannelId = state.currentChannelId || config.id
}

export async function saveState(): Promise<void> {
    await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + "\n")
}
