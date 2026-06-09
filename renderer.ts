import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { Theme } from "./theme";
import { client } from "./discord";

export const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
  backgroundColor: Theme.background,
  onDestroy: () => {
    client.destroy();
  },
})

renderer.keyInput.on("keypress", (key) => {
  if (key.name === "`") {
    renderer.console.toggle()
  }
})

