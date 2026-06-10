# Shell — Discord terminal client

## Runtime & setup
- **Bun** (not Node/npm). Install deps: `bun install`. Run: `bun run index.ts`.
- Requires a Discord bot token. Set via `DISCORD_TOKEN` env var or `token` in `~/.shell/config.toml`.
- User data lives in `~/.shell/`: `config.toml`, `state.json`, `themes/*.json`.
- Example config at `examples/config.toml`.

## Commands
| Command | Purpose |
|---------|---------|
| `bun run index.ts` | Run the app |
| `bunx eslint .` | Lint (flat config with typescript-eslint) |
| `bunx tsc --noEmit` | Typecheck (TS 6.x peer dep) |

No test framework.

## Architecture
- `index.ts` — entrypoint; ensures dirs, loads config/state, logs into Discord, then dynamically imports TUI. Process shutdown destroys the Discord client.
- `config.ts` — single source of truth; exports `config`/`state` objects. Imports `config.toml` via Bun's `import ... with { type: "toml" }`. Accepts a `[discord]` nested table for `token`/`id` alongside top-level keys.
- `discord/` — Discord.js wrapper (client, guilds, messages, members). GatewayIntentBits: Guilds, GuildMessages, MessageContent, **GuildMembers**.
- `components/` — OpenTUI components: chat (sliding window: 3 chunks × `chunkSize` messages), message box, guild/channel selector, banner.
- `renderer.ts` — creates OpenTUI CLI renderer; backtick toggles console overlay (30% height).
- `theme.ts` — loads JSON theme from `~/.shell/themes/<name>.json`, parses colors with `Bun.color()`.
- TUI (`tui.ts`) is imported dynamically after login — module-level code in components runs only after Discord is ready.

## Key bindings (runtime)
- `Ctrl+Tab` — focus guild/channel selector; `Ctrl+Tab` again to dismiss.
- `PgUp` / `Alt+Up` — load older message chunks.
- `PgDn` / `Alt+Down` — load newer message chunks.
- `Ctrl+S` — send message from text area.
- Backtick — toggle debug console overlay.

## Configuration
- `~/.shell/config.toml` fields: `theme` (string), `token` (string), `id` (channel ID string), `chunkSize` (number). Also accepts a `[discord]` table with nested `token`/`id`.
- `~/.shell/state.json` — persisted state (current channel ID).
- `~/.shell/themes/` — `*.json` theme files selected by `theme` in config.
- First run copies `examples/config.toml` and `examples/themes/*.json` into `~/.shell/`.
