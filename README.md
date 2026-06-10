# ◐ Shell: A tiny Discord terminal client

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Configuration

Shell stores local configuration in `~/.shell/config.toml`. On first run it creates that file from `examples/config.toml`. Put your bot token in the `token` field there, or set `DISCORD_TOKEN` in your shell if you need a temporary override.
