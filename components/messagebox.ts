import { TextareaRenderable, BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"
import { currentChannelId } from "../config"
import { sendMessage } from "../discord/messages"
import { hintBox } from "./messagehint"
import { initHintSystem, processTextForSend } from "../lib/messagehint"

export const textArea = new TextareaRenderable(renderer, {
    width: "100%",
    minHeight: 1,
    maxHeight: 5,
    backgroundColor: theme.input.base,
    focusedBackgroundColor: theme.input.focused,
    textColor: theme.input.text,
    focusedTextColor: theme.input.focusedText,
    cursorColor: theme.input.cursor,
    placeholderColor: theme.input.placeholder,
    selectionBg: theme.input.selectionBg,
    selectionFg: theme.input.selectionFg,
    placeholder: "Type here. Ctrl+S to send.",
    onSubmit: () => {
      const text = processTextForSend();
      if (text.length === 0) {
        return;
      }
      if (!currentChannelId) {
        return;
      }
      const channelId = currentChannelId;
      textArea.setText("");
      void sendMessage(channelId, text)
        .catch((error) => {
          textArea.setText(text);
        });
    },
    keyBindings: [{ name: "s", ctrl: true, action: "submit" }],
  })

initHintSystem(textArea)

export const messageBox = new BoxRenderable(renderer, {
    id: "message-box",
    width: "100%",
    flexShrink: 0,
    marginTop: "auto",
    flexDirection: "column",
})

messageBox.add(hintBox)
messageBox.add(textArea)
