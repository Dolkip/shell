import { Text } from "@opentui/core"
import { renderer } from "./renderer"
import { loadTheme } from "./theme"

const theme = await loadTheme()

renderer.root.add(
  Text({
    content: "Hello, OpenTUI!",
    fg: theme.accent,
  }),
)