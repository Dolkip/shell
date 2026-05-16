import { createCliRenderer } from "@opentui/core";
import { Theme } from "./theme";

export const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  backgroundColor: Theme.background,
})
