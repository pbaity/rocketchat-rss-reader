import { IHttp, IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedStore } from './FeedStore';
import { IFeed } from './IFeed';

export class FeedManager {
    public static async subscribe(url: string, context: SlashCommandContext, persis: IPersistence, http: IHttp): Promise<IMessage> {
        const message: IMessage = {
            room: context.getRoom(),
            sender: context.getSender(),
            groupable: false,
        };

        try {
            const response = await http.get(url);
            if (response.data.status === 'ok') {
                const feed: IFeed = response.data.feed as IFeed;
                await FeedStore.subscribe(persis, message.room, feed);
                message.text = `Subscribed to feed ${feed.title} at ${feed.url}.`;
            } else {
                message.text = `Failed to subscribed to feed at ${url}.`;
            }
            return message;
        } catch (err) {
            console.error(err);
            throw new Error(err);
        }
    }

    public static async list(context: SlashCommandContext, persis: IPersistenceRead): Promise<IMessage> {
        const message: IMessage = {
            room: context.getRoom(),
            sender: context.getSender(),
            groupable: false,
        };

        const feeds: Array<IFeed> = await FeedStore.list(persis, message.room);

        for (const feed of feeds) {
            message.text += `${feed.uuid}: ${feed.title} - ${feed.url}\n`;
        }

        return message;
    }

    public static async remove(uuid: string, context: SlashCommandContext, persis: IPersistence): Promise<IMessage> {
        const message: IMessage = {
            room: context.getRoom(),
            sender: context.getSender(),
            groupable: false,
        };

        try {
            await FeedStore.remove(persis, message.room, uuid);
            message.text = `Removed feed with ID ${uuid}.`;
            return message;
        } catch (err) {
            console.error(err);
            message.text = `Failed to remove feed with ID ${uuid}.`;
            return message;
        }
    }

    public static async help(context: SlashCommandContext): Promise<IMessage> {
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

        return message;
    }
}
