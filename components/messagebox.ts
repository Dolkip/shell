import { TextareaRenderable, BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { theme } from "../theme"
import { currentChannelId } from "../config"
import { sendMessage } from "../discord"

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
      if (textArea.plainText.length === 0) {
        return;
      }
      if (!currentChannelId) {
        return;
      }
      const message = textArea.plainText;
      const channelId = currentChannelId;
      textArea.setText("");
      void sendMessage(channelId, message)
        .catch((error) => {
          textArea.setText(message);
        });
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
