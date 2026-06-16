import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { theme } from "./theme";
import { client } from "./discord/client";

export const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
  backgroundColor: theme.background,
  onDestroy: () => {
    client.destroy();
  },
})

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "/") {
    renderer.console.toggle()
  }
})

