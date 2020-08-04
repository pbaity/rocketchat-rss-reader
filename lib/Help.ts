import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { sendNotification } from './send';

export async function help(context: SlashCommandContext, modify: IModify): Promise<void> {
    const text = `Commands: subscribe, remove, list, help
                 To subscribe to an RSS feed in this channel: \`/rss subscribe <url>\`
                 To list subscribed RSS feeds in this channel: \`/rss list\`
                 To remove an RSS feed from this channel: \`/rss remove <url>\``;

    const message: IMessage = {
        room: context.getRoom(),
        sender: context.getSender(),
        text,
        groupable: false,
    };

    await sendNotification(message, modify);
}
