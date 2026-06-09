import { TextRenderable, BoxRenderable, MarkdownRenderable, SyntaxStyle, RGBA } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme";
import { Message, GuildMember } from "discord.js";
import { getColour } from "../discord"

const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading": { fg: Theme.accent, bold: true },
  "markup.heading.1": { fg: RGBA.fromHex("#58A6FF"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#58A6FF") },
  "markup.heading.3": { fg: RGBA.fromHex("#58A6FF") },
  "markup.strong": { bold: true },
  "markup.italic": { italic: true },
  "markup.strikethrough": { fg: Theme.dim },
  "markup.raw": { fg: RGBA.fromHex("#A5D6FF") },
  "markup.raw.block": { fg: RGBA.fromHex("#A5D6FF") },
  "markup.link": { fg: RGBA.fromHex("#58A6FF"), underline: true },
  "markup.link.url": { fg: RGBA.fromHex("#58A6FF"), underline: true },
  "markup.link.label": { fg: RGBA.fromHex("#58A6FF") },
  "markup.list": { fg: RGBA.fromHex("#FF7B72") },
  "markup.quote": { fg: Theme.dim, italic: true },
  conceal: { fg: Theme.dim },
  default: { fg: Theme.text },
})

export async function makeMessage(message: Message) {
  const container = new BoxRenderable(renderer, {
    id: message.id,
    flexDirection: "column",
    width: "100%",
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
        syntaxStyle,
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
    width: "100%",
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

  const contentBox = new BoxRenderable(renderer, {
    flexGrow: 1,
    flexDirection: "column",
    width: "100%",
  });

  const messageText = new MarkdownRenderable(renderer, {
    content: message.content,
    fg: Theme.message.text,
    syntaxStyle,
    width: "100%",
  });

  contentBox.add(messageText)
  messageRow.add(userText);
  messageRow.add(contentBox);

  container.add(messageRow);

  return container;
}