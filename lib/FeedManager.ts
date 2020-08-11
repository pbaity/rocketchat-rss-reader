import { IHttp, IModify, IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedReader } from './FeedReader';
import { FeedStore } from './FeedStore';
import { IFeed } from './IFeed';
import { IFeedItem } from './IFeedItem';
import { Messenger } from './Messenger';

export class FeedManager {
    public static initializeAutoReader(context: SlashCommandContext, persis: IPersistence, reader: IPersistenceRead, http: IHttp, modify: IModify): void {
        setInterval(async () => {
            const feeds: Array<IFeed> = await FeedStore.getAllFeeds(reader);
            if (feeds.length) {
                for (const feed of feeds) {
                    const messages: Array<IMessage> = await this.read(feed, persis, context, http);
                    if (messages.length) {
                        for (const message of messages) {
                            Messenger.notify(message, modify);
                        }
                    }
                }
            }
        }, 1000 * 60 * 20);
    }

    public static async subscribe(url: string, context: SlashCommandContext, persis: IPersistence, modify: IModify, http: IHttp): Promise<void> {
        const message: IMessage = {
            room: context.getRoom(),
            sender: context.getSender(),
            groupable: false,
        };

        try {
            const feed: IFeed = await FeedReader.getFeedInfo(url, http);
            await FeedStore.add(persis, message.room, feed);
            message.text = `Subscribed to feed ${feed.title} at ${feed.link}.`;
        } catch (err) {
            message.text = `Failed to subscribe to feed at ${url}.`;
            console.error(err);
        }

        Messenger.notify(message, modify);
    }

    public static async list(context: SlashCommandContext, persis: IPersistenceRead, modify: IModify): Promise<void> {
        const message: IMessage = {
            room: context.getRoom(),
            text: '',
            sender: context.getSender(),
            groupable: false,
        };

        const feeds: Array<IFeed> = await FeedStore.getRoomFeeds(message.room, persis);

        if (feeds.length) {
            for (const feed of feeds) {
                message.text += `${feed.uuid}: ${feed.title} - ${feed.link}\n`;
            }
        } else {
            message.text = 'You have no feeds. Use `/rss subscribe <url>` to add one.';
        }

        Messenger.notify(message, modify);
    }

    public static async remove(uuid: string, context: SlashCommandContext, persis: IPersistence, modify: IModify): Promise<void> {
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

        Messenger.notify(message, modify);
    }

    public static help(context: SlashCommandContext, modify: IModify): void {
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

        Messenger.notify(message, modify);
    }

    private static async read(feed: IFeed, persis: IPersistence, context: SlashCommandContext, http: IHttp): Promise<Array<IMessage>> {
        const messages: Array<IMessage> = [];
        const newItems: Array<IFeedItem> = await FeedReader.getNewFeedItems(feed, http);

        if (newItems.length) {
            feed.lastItemLink = newItems[0].link;
            FeedStore.update(persis, context.getRoom(), feed);
            for (const item of newItems) {
                messages.push({
                    room: context.getRoom(),
                    sender: context.getSender(),
                    groupable: false,
                    text: `${item.title}\n${item.link}`,
                });
            }
        }

        return messages;
    }
}
