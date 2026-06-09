import { TextareaRenderable, BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"
import { currentChannelId } from "../config"
import { sendMessage } from "../discord"

export const textArea = new TextareaRenderable(renderer, {
    width: "100%",
    minHeight: 1,
    maxHeight: 5,
  
    backgroundColor: Theme.input.base,
    focusedBackgroundColor: Theme.input.focused,
    textColor: Theme.input.text,
    focusedTextColor: Theme.input.focusedText,
    cursorColor: Theme.input.cursor,
    placeholderColor: Theme.input.placeholder,
    selectionBg: Theme.input.selectionBg,
    selectionFg: Theme.input.selectionFg,
    placeholder: "Type here. Ctrl+S to send.",
    onSubmit: () => {
      if (textArea.plainText.length === 0) {
        return;
      }
      if (!currentChannelId) {
        return;
      }
      console.log("sent:", textArea.plainText);
      sendMessage(currentChannelId, textArea.plainText);
      textArea.setText("");
    },
    keyBindings: [{ name: "s", ctrl: true, action: "submit" }],
  })

export const messageBox = new BoxRenderable(renderer, {
    id: "message-box",
    width: "100%",
    flexShrink: 0,
    marginTop: "auto",
    flexDirection: "column",
})

messageBox.add(textArea)
