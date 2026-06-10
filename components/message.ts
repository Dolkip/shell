import { TextRenderable, BoxRenderable, MarkdownRenderable, SyntaxStyle } from "@opentui/core";
import { renderer } from "../renderer";
import { Theme } from "../theme";
import { Message } from "discord.js";
import { getColour } from "../discord"

const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading": { fg: Theme.markdown.heading, bold: true },
  "markup.heading.1": { fg: Theme.markdown.heading1, bold: true },
  "markup.heading.2": { fg: Theme.markdown.heading2 },
  "markup.heading.3": { fg: Theme.markdown.heading3 },
  "markup.strong": { bold: true },
  "markup.italic": { italic: true },
  "markup.strikethrough": { fg: Theme.dim },
  "markup.raw": { fg: Theme.markdown.code },
  "markup.raw.block": { fg: Theme.markdown.codeBlock },
  "markup.link": { fg: Theme.markdown.link, underline: true },
  "markup.link.url": { fg: Theme.markdown.link, underline: true },
  "markup.link.label": { fg: Theme.markdown.link },
  "markup.list": { fg: Theme.markdown.list },
  "markup.quote": { fg: Theme.markdown.quote, italic: true },
  conceal: { fg: Theme.markdown.conceal },
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

  const messageRow = new BoxRenderable(renderer, {
    flexDirection: "row",
    width: "100%",
  });

  const colour = getColour(
    message.member ?? undefined,
    Theme.text
  );

  const timestampText = new TextRenderable(renderer, {
    content: message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " ",
    fg: Theme.dim,
    flexShrink: 0,
  });

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
  messageRow.add(timestampText);
  messageRow.add(userText);
  messageRow.add(contentBox);

  container.add(messageRow);

  return container;
}