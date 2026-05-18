import { TextareaRenderable, BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"
import { sendMessage } from "../discord"

const LINES = 5

export const textArea = new TextareaRenderable(renderer, {
    width: "100%",
    minHeight: 1,
    maxHeight: 5,
  
    backgroundColor: Theme.inputBackground,
    focusedBackgroundColor: Theme.inputFocusedBackground,
    textColor: Theme.inputText,
    cursorColor: Theme.inputCursor,
    placeholder: "Type here. Ctrl+S to send.",
    onSubmit: () => {
      if (textArea.plainText.length === 0) {
        return;
      }
      console.log("sent:", textArea.plainText);
      sendMessage("1504647011369226250", textArea.plainText);
      textArea.setText(""); //wipe textarea
    },
    keyBindings: [{ name: "s", ctrl: true, action: "submit" }],
  })

//neat box it lives in
export const messageBox = new BoxRenderable(renderer, {
    id: "message-box",
    width: "100%",
    flexShrink: 0,
    marginTop: "auto",
    flexDirection: "column",
    border: true,
    borderStyle: "rounded",
    borderColor: Theme.border,
})

//puts the thing in the box
messageBox.add(textArea)