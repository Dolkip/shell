import { TextareaRenderable } from "@opentui/core";
import { renderer } from "../renderer"
import { Theme } from "../theme"

export const messageBox = new TextareaRenderable(
    renderer,
    {
        //todo: make these depend on Theme!
        backgroundColor: "#1a1a1a",
        focusedBackgroundColor: "#222222",
        textColor: "#FFFFFF",
        cursorColor: "#00FF88",
    }
)