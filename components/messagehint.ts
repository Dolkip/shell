import { BoxRenderable, SelectRenderable, type SelectOption } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"

export const hintBox = new BoxRenderable(renderer, {
  id: "message-hint",
  width: "100%",
  flexDirection: "column",
})

export let hintSelect: SelectRenderable | null = null

export function showHint(options: SelectOption[]): void {
  clearHint()
  if (options.length === 0) return

  const linesPerItem = 2
  const maxVisible = Math.min(options.length, 10)
  const hintHeight = maxVisible * linesPerItem

  hintSelect = new SelectRenderable(renderer, {
    id: "hint-select",
    options,
    selectedIndex: 0,
    width: "100%",
    height: hintHeight,
    textColor: theme.select.text,
    backgroundColor: theme.select.base,
    focusedBackgroundColor: theme.select.focused,
    focusedTextColor: theme.select.focusedText,
    selectedBackgroundColor: theme.select.selected,
    selectedTextColor: theme.select.selectedText,
    descriptionColor: theme.select.description,
    selectedDescriptionColor: theme.select.selectedDescription,
    showDescription: true,
  })

  hintBox.add(hintSelect)
}

export function updateHint(options: SelectOption[]): void {
  if (!hintSelect) {
    showHint(options)
    return
  }
  hintSelect.options = options
  if (options.length > 0) {
    hintSelect.setSelectedIndex(0)
  }
}

export function clearHint(): void {
  if (hintSelect) {
    hintSelect.destroy()
    hintSelect = null
  }
  for (const child of hintBox.getChildren()) {
    hintBox.remove(child.id)
  }
}

export function isHintVisible(): boolean {
  return hintSelect !== null
}

export function selectNextHint(): void {
  hintSelect?.moveDown()
}

export function selectPrevHint(): void {
  hintSelect?.moveUp()
}
