import { TextRenderable, BoxRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme";
import { Message, GuildMember } from "discord.js";
import { getColour } from "../discord"

export function makeMessage(message: Message) {
  const container = new BoxRenderable(renderer, {
    flexDirection: "row",
    marginBottom: 1,
  });

  const color = getColour(message.member ?? undefined, Theme.text?.toString());

  const userText = new TextRenderable(renderer, {
    content: message.author.username + ": ",
    fg: color,
    flexShrink: 0,
  });

  const messageText = new TextRenderable(renderer, {
    content: message.content,
    fg: Theme.text,
  });

  container.add(userText);
  container.add(messageText);

  return container;
}