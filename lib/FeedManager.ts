import { IHttp, IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedReader } from './FeedReader';
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
            const feed: IFeed = await FeedReader.getFeedInfo(url, http);
            await FeedStore.subscribe(persis, message.room, feed);
            message.text = `Subscribed to feed ${feed.title} at ${feed.link}.`;
        } catch (err) {
            message.text = `Failed to subscribe to feed at ${url}.`;
            console.error(err);
        }

        return message;
    }

    public static async list(context: SlashCommandContext, persis: IPersistenceRead): Promise<IMessage> {
        const message: IMessage = {
            room: context.getRoom(),
            text: '',
            sender: context.getSender(),
            groupable: false,
        };

        const feeds: Array<IFeed> = await FeedStore.list(persis, message.room);

        if (feeds.length) {
            for (const feed of feeds) {
                message.text += `${feed.uuid}: ${feed.title} - ${feed.link}\n`;
            }
        } else {
            message.text = 'You have no feeds. Use `/rss subscribe <url>` to add one.';
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
        } catch (err) {
            console.error(err);
            message.text = `Failed to remove feed with ID ${uuid}.`;
        }

        return message;
    }

    public static async help(context: SlashCommandContext): Promise<IMessage> {
        const text = `Commands: subscribe, remove, list, help
                     To subscribe to an RSS feed in this channel: \`/rss subscribe <url>\`
                     To list subscribed RSS feeds in this channel: \`/rss list\`
                     To remove an RSS feed from this channel: \`/rss remove <ID>\``;

        const message: IMessage = {
            room: context.getRoom(),
            sender: context.getSender(),
            text,
            groupable: false,
        };

        return message;
    }
}
