# Shell — Discord terminal client

## Runtime & setup
- **Bun** (not Node/npm). Install deps: `bun install`. Run: `bun run index.ts`.
- Requires a Discord bot token. Set via `DISCORD_TOKEN` env var or `token` in `~/.shell/config.toml`.
- User data lives in `~/.shell/`: `config.toml`, `state.json`, `themes/*.json`.
- An example config is at `examples/config.toml`.

## Commands
| Command | Purpose |
|---------|---------|
| `bun run index.ts` | Run the app |
| `bunx eslint .` | Lint (flat config with typescript-eslint) |
| `bunx tsc --noEmit` | Typecheck (TS 6.x is a peer dep) |

No test framework is configured.

## Architecture
- `index.ts` — entrypoint; calls `ensureDirectories()`, `loadConfig()`, `loadState()`, logs into Discord, then dynamically imports TUI.
- `config.ts` — single source of truth: exports `config` and `state` objects, handles loading from `~/.shell/config.toml`, creates default files.
- `discord/` — Discord API wrapper (client, guilds, messages, members).
- `components/` — OpenTUI components: chat, message box, guild selector, banner.
- `renderer.ts` — OpenTUI `createCliRenderer`. Backtick toggles console overlay (size=30%).
- `theme.ts` — loads a JSON theme from `~/.shell/themes/<name>.json` and parses colors with `Bun.color()`.
- `discord/` `GatewayIntentBits`: Guilds, GuildMessages, MessageContent.

## Key bindings (runtime)
- `Ctrl+Tab` — focus guild/ channel selector; `Ctrl+Tab` again to dismiss.
- `PgUp` / `Alt+Up` — load older message chunks.
- `PgDn` / `Alt+Down` — load newer message chunks.
- `Ctrl+S` — send message from text area.
- Backtick — toggle debug console overlay.

## Configuration
- `~/.shell/config.toml` fields: `theme` (string), `token` (string), `id` (channel ID string), `chunkSize` (number).
- `~/.shell/state.json` — persisted state (current theme, last channel).
- `~/.shell/themes/` — contains `*.json` theme files; selected by `theme` in config.
