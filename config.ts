import { join } from "node:path"
import { homedir } from "node:os"
import { Glob } from "bun"
import { mkdir, access, readdir, copyFile } from "node:fs/promises"

export const SHELLDIR = join(homedir(), ".shell")
const THEMES_DIR = join(SHELLDIR, "themes")
const EXAMPLES = join(import.meta.dir, "examples")

export interface Config {
    theme: string
    chunkSize: number
    discord: {
        token: string
        id: string
        guild: string
    }
}

export let config: Config = {
    theme: "shell",
    chunkSize: 50,
    discord: { token: "", id: "", guild: "" },
}

export let currentChannelId = ""

export function setCurrentChannelId(id: string) {
    currentChannelId = id
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

    const themes = Array.from(new Glob("*.json").scanSync(THEMES_DIR))
    if (themes.length === 0) {
        const themeFiles = await readdir(join(EXAMPLES, "themes"))
        for (const file of themeFiles) {
            await copyFile(join(EXAMPLES, "themes", file), join(THEMES_DIR, file))
        }
    }
}

export async function loadConfig(): Promise<void> {
    const mod = await import(join(SHELLDIR, "config.toml"), { with: { type: "toml" } }) as Record<string, unknown>
    const raw = (mod.default ?? mod) as Record<string, unknown>

    if (!isPlainObject(raw)) throw new Error("config.toml must be a table")
    if (!isString(raw.theme)) throw new Error(`config.toml: theme (${typeof raw.theme}) must be a string`)
    if (typeof raw.chunkSize !== "number") throw new Error(`config.toml: chunkSize (${typeof raw.chunkSize}) must be a number`)

    const discord = raw.discord
    if (!isPlainObject(discord)) throw new Error("config.toml: [discord] section required")
    if (!isString(discord.token)) throw new Error(`config.toml: discord.token (${typeof discord.token}) must be a string`)
    if (!isString(discord.id)) throw new Error(`config.toml: discord.id (${typeof discord.id}) must be a string`)
    if (!isString(discord.guild)) throw new Error(`config.toml: discord.guild (${typeof discord.guild}) must be a string`)

    config = raw as unknown as Config
}
