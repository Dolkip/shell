# Shell — Discord terminal client

## Runtime & setup
- **Bun** (not Node/npm). Install deps: `bun install`. Run: `bun run index.ts`.
- Requires a Discord bot token. Set via `DISCORD_TOKEN` env var or `token` in `config.toml`.
- `config.toml` is gitignored (it holds secrets). An example is at `.env.example`.
- `themes/` dir contains JSON theme files; selected by `theme` field in `config.toml`.
- Project uses TOML import syntax (`import config from "./config.toml" with { type: "toml" }`) — Bun-specific.

## Commands
| Command | Purpose |
|---------|---------|
| `bun run index.ts` | Run the app |
| `bunx eslint .` | Lint (flat config with typescript-eslint) |
| `bunx tsc --noEmit` | Typecheck (TS 6.x is a peer dep) |

No test framework is configured.

## Architecture
- `index.ts` — entrypoint; logs into Discord via `discord.js`, then starts the TUI.
- `discord/` — Discord API wrapper (client, guilds, messages, members).
- `components/` — OpenTUI components: chat, message box, guild selector, banner.
- `renderer.ts` — OpenTUI `createCliRenderer`. Backtick toggles console overlay (size=30%).
- `theme.ts` — Loads a JSON theme from `themes/<name>.json` and parses colors with `Bun.color()`.
- `discord/` `GatewayIntentBits`: Guilds, GuildMessages, MessageContent.

## Key bindings (runtime)
- `Ctrl+Tab` — focus guild/ channel selector; `Ctrl+Tab` again to dismiss.
- `PgUp` / `Alt+Up` — load older message chunks.
- `PgDn` / `Alt+Down` — load newer message chunks.
- `Ctrl+S` — send message from text area.
- Backtick — toggle debug console overlay.

## Configuration
- `config.toml` fields: `theme` (string), `token` (string), `id` (channel ID string, hardcoded fallback in `components/messagebox.ts`).
- The channel ID `1504647011369226250` is hardcoded in `components/messagebox.ts:23` as the target for sending messages.
