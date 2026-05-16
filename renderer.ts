import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { Theme } from "./theme";

export const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
  backgroundColor: Theme.background,
})

renderer.keyInput.on("keypress", (key) => {
  // Toggle with backtick key
  if (key.name === "`") {
    renderer.console.toggle()
  }
})

console.log("hey");