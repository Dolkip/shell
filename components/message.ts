import { TextRenderable, BoxRenderable, TextAttributes, MarkdownRenderable } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme";
import { Message, GuildMember } from "discord.js";
import { getColour } from "../discord"

/*
const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  default: { fg: RGBA.fromHex("#E6EDF3") },
})
  */

export async function makeMessage(message: Message) {
  const container = new BoxRenderable(renderer, {
    id: message.id,
    flexDirection: "column",
    backgroundColor: Theme.message.base,
    marginBottom: 0,
    onMouseOver: () => {
      container.backgroundColor = Theme.message.hover
    },
    onMouseOut: () => {
      container.backgroundColor = Theme.message.base
    }
  });

  // the reply! wowow
  if (message.reference?.messageId) {
    let repliedTo = null;
  
    try {
      repliedTo = await message.channel.messages.fetch(message.reference.messageId);
    } catch {
      repliedTo = null;
    }
  
    if (repliedTo) {
      const reply = new BoxRenderable(renderer, {
        flexDirection: "row",
      });
  
      const replyChar = new TextRenderable(renderer, {
        fg: Theme.dim,
        content: "╭─",
        flexShrink: 0,
      });
  
      const replyColour = getColour(
        repliedTo.member ?? undefined,
        Theme.text
      );
  
      const replyUser = new TextRenderable(renderer, {
        fg: replyColour,
        content: repliedTo.author.username + ": ",
        flexShrink: 0,
      });
  
      const replyText = new MarkdownRenderable(renderer, {
        fg: Theme.dim,
        content: repliedTo.content || "[attachment]",
      });
  
      reply.add(replyChar);
      reply.add(replyUser);
      reply.add(replyText);
  
      container.add(reply);
    } else {
      container.add(
        new TextRenderable(renderer, {
          fg: Theme.dim,
          content: "╭─ [unavailable message]",
        })
      );
    }
  }

  // the the the
  const messageRow = new BoxRenderable(renderer, {
    flexDirection: "row",
  });

  const colour = getColour(
    message.member ?? undefined,
    Theme.text
  );

  const userText = new TextRenderable(renderer, {
    content: message.author.username + "  ",
    fg: colour,
    flexShrink: 0,
  });

  const messageText = new MarkdownRenderable(renderer, {
    content: message.content,
    fg: Theme.text,
  });

  messageRow.add(userText);
  messageRow.add(messageText);

  container.add(messageRow);

  return container;
}