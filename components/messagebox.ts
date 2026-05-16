import { TextareaRenderable, BoxRenderable } from "@opentui/core"
import { renderer } from "../renderer"
import { Theme } from "../theme"
import { sendMessage } from "../discord"

const LINES = 5

export const textArea = new TextareaRenderable(renderer, {
    width: "100%",
    minHeight: 1,
    maxHeight: 5,
  
    backgroundColor: Theme.textareabackground,
    focusedBackgroundColor: "#222222",
    textColor: Theme.text,
    cursorColor: Theme.accent,
    onSubmit: () => {
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
    padding: 0,
})

//puts the thing in the box
messageBox.add(textArea)
