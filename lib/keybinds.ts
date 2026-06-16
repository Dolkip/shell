import { renderer } from "../renderer"
import { loadOlderChunk, loadNewerChunk } from "./chat-history"

export interface KeybindActions {
  onCtrlN: () => void
  onCtrlU: () => void
  onEscape: () => void
  onCtrlTab: () => void
  onDmDown: () => void
  onDmUp: () => void
  isChannelSelectFocused: () => boolean
  isDmSearchFocused: () => boolean
  isDmActive: () => boolean
}

export function setupKeybinds(actions: KeybindActions): void {
  renderer.keyInput.on("keypress", (key: any) => {
    if (key.ctrl && key.name === "tab") {
      actions.onCtrlTab()
      return
    }

    if (key.ctrl && key.name === "n") {
      actions.onCtrlN()
      return
    }

    if (key.ctrl && key.name === "u") {
      actions.onCtrlU()
      return
    }

    if (actions.isChannelSelectFocused()) return

    if (key.name === "pageup" || (key.alt && key.name === "up")) {
      void loadOlderChunk()
      return
    }

    if (key.name === "pagedown" || (key.alt && key.name === "down")) {
      void loadNewerChunk()
      return
    }

    if (key.name === "escape") {
      actions.onEscape()
      return
    }

    if (actions.isDmActive() && actions.isDmSearchFocused()) {
      if (key.name === "down") {
        actions.onDmDown()
        return
      }
      if (key.name === "up") {
        actions.onDmUp()
        return
      }
    }
  })
}
