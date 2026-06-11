import { TextareaRenderable, SyntaxStyle, type KeyEvent, type SelectOption } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"
import { client } from "../discord"
import { currentChannelId } from "../config"
import { updateHint, clearHint, isHintVisible, selectNextHint, selectPrevHint, hintSelect } from "../components/messagehint"

interface MentionCandidate {
  userId: string
  username: string
  displayName: string
}

interface HintTrigger {
  startPos: number
  query: string
}

let activeTextarea: TextareaRenderable | null = null
let mentionTypeId = 0
let mentionStyleId = 0
let currentTrigger: HintTrigger | null = null

export function initHintSystem(textarea: TextareaRenderable): void {
  activeTextarea = textarea

  const style = SyntaxStyle.create()
  mentionStyleId = style.registerStyle("mention", {
    fg: theme.text,
    bg: theme.accent,
  })
  textarea.syntaxStyle = style

  mentionTypeId = textarea.extmarks.registerType("mention")

  textarea.onContentChange = handleContentChange

  renderer.keyInput.on("keypress", handleKey)
}

export function processTextForSend(): string {
  if (!activeTextarea) return ""
  const text = activeTextarea.plainText
  const extmarks = activeTextarea.extmarks.getAllForTypeId(mentionTypeId)
  if (extmarks.length === 0) return text

  let result = text
  for (const em of [...extmarks].sort((a, b) => b.start - a.start)) {
    const mentionHtml = `<@${em.data.userId}>`
    result = result.slice(0, em.start) + mentionHtml + result.slice(em.end)
  }

  return result
}

function handleContentChange(): void {
  if (!activeTextarea) return
  const text = activeTextarea.plainText
  const cursorPos = activeTextarea.cursorOffset

  const trigger = detectTrigger(text, cursorPos)

  if (trigger) {
    currentTrigger = trigger
    void fetchAndShowOptions(trigger.query)
  } else {
    currentTrigger = null
    clearHint()
  }
}

function handleKey(key: KeyEvent): void {
  if (!isHintVisible()) return

  if (key.name === "up") {
    selectPrevHint()
    key.stopPropagation()
    return
  }
  if (key.name === "down") {
    selectNextHint()
    key.stopPropagation()
    return
  }
  if (key.name === "tab") {
    confirmMention()
    key.stopPropagation()
    return
  }
  if (key.name === "escape") {
    currentTrigger = null
    clearHint()
    key.stopPropagation()
    return
  }
}

function detectTrigger(text: string, cursorPos: number): HintTrigger | null {
  if (cursorPos <= 0) return null

  let pos = cursorPos - 1
  while (pos >= 0) {
    const ch = text[pos]!
    if (ch === "@") {
      if (pos === 0 || (pos > 0 && /\s/.test(text[pos - 1]!))) {
        const query = text.slice(pos + 1, cursorPos)
        if (/\s/.test(query)) return null

        if (activeTextarea) {
          const atPos = activeTextarea.extmarks.getAtOffset(pos)
          if (atPos.some((em) => em.typeId === mentionTypeId)) return null
        }

        return { startPos: pos, query }
      }
      return null
    }
    if (/\s/.test(ch)) return null
    pos--
  }
  return null
}

async function fetchAndShowOptions(query: string): Promise<void> {
  if (!currentChannelId) return

  const candidates = await searchCandidates(query)

  const options: SelectOption[] = candidates.map((c) => ({
    name: c.displayName,
    description: `@${c.username}`,
    value: c.userId,
  }))

  updateHint(options)
}

async function searchCandidates(query: string): Promise<MentionCandidate[]> {
  if (!currentChannelId) return []

  const channel = client.channels.cache.get(currentChannelId)
  if (!channel) return []

  const lc = query.toLowerCase()
  const seen = new Set<string>()
  const results: MentionCandidate[] = []
  const guilds = channel.isDMBased()
    ? [...client.guilds.cache.values()]
    : "guildId" in channel && channel.guildId
      ? [client.guilds.cache.get(channel.guildId)].filter((g): g is NonNullable<typeof g> => g != null)
      : []

  for (const guild of guilds) {
    for (const [, member] of guild.members.cache) {
      if (seen.has(member.id)) continue
      const user = member.user
      if (
        member.nickname?.toLowerCase().includes(lc) ||
        user.username.toLowerCase().includes(lc) ||
        user.globalName?.toLowerCase().includes(lc)
      ) {
        seen.add(member.id)
        results.push({
          userId: member.id,
          username: user.username,
          displayName: member.nickname ?? user.globalName ?? user.username,
        })
      }
    }
  }

  return results.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

function confirmMention(): void {
  if (!activeTextarea || !currentTrigger) return

  if (!hintSelect) return

  const option = hintSelect.getSelectedOption()
  if (!option || typeof option.value !== "string") return

  const userId = option.value
  const displayName = option.name

  const mentionText = `@${displayName}`
  const triggerStart = currentTrigger.startPos
  const triggerEnd = activeTextarea.cursorOffset

  activeTextarea.setSelection(triggerStart, triggerEnd)
  activeTextarea.deleteSelection()
  activeTextarea.insertText(mentionText)

  const extmarkEnd = activeTextarea.cursorOffset 

  activeTextarea.extmarks.create({
    start: triggerStart,
    end: extmarkEnd,
    virtual: true,
    styleId: mentionStyleId,
    typeId: mentionTypeId,
    data: { userId },
  })

  activeTextarea.insertText(" ")

  currentTrigger = null
  clearHint()
}
