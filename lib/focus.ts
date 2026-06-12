import { renderer } from "../renderer"
import type { KeyEvent } from "@opentui/core"

export interface FocusZone {
  id: string
  focus: () => void
  blur: () => void
  isActive?: () => boolean
}

class FocusManager {
  private zones: FocusZone[] = []
  private index = -1

  register(zone: FocusZone): void {
    this.zones.push(zone)
  }

  unregister(id: string): void {
    const idx = this.zones.findIndex(z => z.id === id)
    if (idx >= 0) {
      this.zones.splice(idx, 1)
      if (this.index >= this.zones.length) {
        this.index = this.zones.length - 1
      }
    }
  }

  find(id: string): FocusZone | undefined {
    return this.zones.find(z => z.id === id)
  }

  focusNext(): void {
    if (this.zones.length === 0) return
    const start = this.index
    let next = (start + 1) % this.zones.length
    while (next !== start) {
      const zone = this.zones[next]
      if (zone && (!zone.isActive || zone.isActive())) {
        this.index = next
        this.apply()
        return
      }
      next = (next + 1) % this.zones.length
    }
  }

  focusPrev(): void {
    if (this.zones.length === 0) return
    const start = this.index
    let prev = (start - 1 + this.zones.length) % this.zones.length
    while (prev !== start) {
      const zone = this.zones[prev]
      if (zone && (!zone.isActive || zone.isActive())) {
        this.index = prev
        this.apply()
        return
      }
      prev = (prev - 1 + this.zones.length) % this.zones.length
    }
  }

  focusById(id: string): void {
    const idx = this.zones.findIndex(z => z.id === id)
    if (idx >= 0) {
      this.index = idx
      this.apply()
    }
  }

  blurAll(): void {
    for (const zone of this.zones) {
      zone.blur()
    }
    this.index = -1
  }

  private apply(): void {
    for (const zone of this.zones) {
      zone.blur()
    }
    const current = this.zones[this.index]
    if (current) {
      current.focus()
    }
  }

  get currentId(): string | null {
    const zone = this.zones[this.index]
    return zone ? zone.id : null
  }
}

export const focusManager = new FocusManager()

let tabHandler: ((key: KeyEvent) => void) | null = null
let f6Handler: ((key: KeyEvent) => void) | null = null

export function activateTabNavigation(): void {
  if (tabHandler) return

  tabHandler = (key: KeyEvent) => {
    if (key.name === "tab" && !key.ctrl) {
      if (key.shift) {
        focusManager.focusPrev()
      } else {
        focusManager.focusNext()
      }
      return
    }
  }

  f6Handler = (key: KeyEvent) => {
    if (key.name === "f6") {
      focusManager.focusNext()
    }
  }

  renderer.keyInput.on("keypress", tabHandler)
  renderer.keyInput.on("keypress", f6Handler)
}

export function deactivateTabNavigation(): void {
  if (tabHandler) {
    renderer.keyInput.removeListener("keypress", tabHandler)
    tabHandler = null
  }
  if (f6Handler) {
    renderer.keyInput.removeListener("keypress", f6Handler)
    f6Handler = null
  }
}
