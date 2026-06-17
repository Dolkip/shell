import { TextRenderable, BoxRenderable, MarkdownRenderable, SyntaxStyle, TextAttributes } from "@opentui/core";
import { renderer } from "../renderer";
import { theme } from "../theme";
import { Message, GuildMember } from "discord.js";
import { getColour, getName } from "../discord/members"

const syntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading": { fg: theme.markdown.heading, bold: true },
  "markup.heading.1": { fg: theme.markdown.heading1, bold: true },
  "markup.heading.2": { fg: theme.markdown.heading2 },
  "markup.heading.3": { fg: theme.markdown.heading3 },
  "markup.strong": { bold: true },
  "markup.italic": { italic: true },
  "markup.strikethrough": { fg: theme.dim },
  "markup.raw": { fg: theme.markdown.code },
  "markup.raw.block": { fg: theme.markdown.code },
  "markup.link": { fg: theme.markdown.link, underline: true },
  "markup.link.url": { fg: theme.markdown.link, underline: true },
  "markup.link.label": { fg: theme.markdown.link },
  "markup.list": { fg: theme.markdown.list },
  "markup.quote": { fg: theme.markdown.quote, italic: true },
  conceal: { fg: theme.markdown.conceal },
  default: { fg: theme.text },
})

function resolveContent(message: Message): string {
  let content = message.content

  for (const [, user] of message.mentions.users) {
    const name = `@${user.displayName}`
    content = content.replaceAll(`<@${user.id}>`, `**${name}**`)
    content = content.replaceAll(`<@!${user.id}>`, `**${name}**`)
  }

  for (const [, role] of message.mentions.roles) {
    content = content.replaceAll(`<@&${role.id}>`, `**@${role.name}**`)
  }

  for (const [, channel] of message.mentions.channels) {
    if ("name" in channel) {
      content = content.replaceAll(`<#${channel.id}>`, `**#${(channel as { name: string }).name}**`)
    }
  }

  return content
}

export async function makeMessage(message: Message) {
  const container = new BoxRenderable(renderer, {
    id: message.id,
    flexDirection: "column",
    width: "100%",
    backgroundColor: theme.message.base,
    marginBottom: 0,
    // padding: 1,
    onMouseOver: () => {
      container.backgroundColor = theme.message.hover
    },
    onMouseOut: () => {
      container.backgroundColor = theme.message.base
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
        flexDirection: "row"
      });

      const replyChar = new TextRenderable(renderer, {
        fg: theme.dim,
        content: "┌──",
        flexShrink: 0,
      });

      const replyColour = getColour(
        repliedTo.member ?? undefined,
        theme.text
      );

      const replyUser = new TextRenderable(renderer, {
        fg: replyColour,
        content: repliedTo.author.username + " ",
        flexShrink: 0,
        attributes: TextAttributes.BOLD
      });

      const replyText = new MarkdownRenderable(renderer, {
        fg: theme.dim,
        content: resolveContent(repliedTo) || "[attachment]",
        syntaxStyle,
        flexGrow: 1,
        width: "100%",
      });

      reply.add(replyChar);
      reply.add(replyUser);
      reply.add(replyText);

      container.add(reply);
    } else {
      container.add(
        new TextRenderable(renderer, {
          fg: theme.dim,
          content: "┌── [unavailable message]",
        })
      );
    }
  }

  const metaRow = new BoxRenderable(renderer, {
    width: "100%",
    flexDirection: "row",
  });

  const colour = getColour(
    message.member ?? undefined,
    theme.text
  );

  const timestamp = new TextRenderable(renderer, {
    content: message.createdAt.toLocaleTimeString([], { month: "2-digit", day: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }) + " ",
    fg: theme.dim,
    flexShrink: 0,
    attributes: TextAttributes.ITALIC
  });

  const userDisplay = new TextRenderable(renderer, {
    content: getName(message.member as GuildMember) + " ",
    fg: colour,
    flexShrink: 0,
    attributes: TextAttributes.BOLD
  });

  const userName = new TextRenderable(renderer, {
    content: message.author.username + " ",
    fg: colour,
    flexShrink: 0,
  });

  const contentBox = new BoxRenderable(renderer, {
    flexGrow: 1,
    flexDirection: "column",
    width: "100%",
  });

  const messageText = new MarkdownRenderable(renderer, {
    content: resolveContent(message),
    fg: theme.message.text,
    syntaxStyle,
    width: "100%",
  });
  
  //the buildy
  metaRow.add(userDisplay);
  metaRow.add(userName);
  metaRow.add(timestamp);
  contentBox.add(metaRow);
  contentBox.add(messageText);
  container.add(contentBox);
  
  return container;
}
