import { IHttp, IModify, IPersistence, IPersistenceRead, IRead, IUserRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { FeedReader } from './FeedReader';
import { FeedStore } from './FeedStore';
import { IFeed } from './IFeed';
import { IFeedItem } from './IFeedItem';
import { Messenger } from './Messenger';

export class FeedManager {
    private appId: string;
    private context: SlashCommandContext;
    private persis: IPersistence;
    private persisRead: IPersistenceRead;
    private http: IHttp;
    private modify: IModify;
    private user: IUser;
    private room: IRoom;

    constructor(appId: string, context: SlashCommandContext, persis: IPersistence, read: IRead, http: IHttp, modify: IModify) {
        this.appId = appId;
        this.context = context;
        this.persis = persis;
        this.persisRead = read.getPersistenceReader();
        this.http = http;
        this.modify = modify;
        this.user = this.context.getSender();
        this.room = this.context.getRoom();
    }

    public initializeAutoReader(): void {
        setInterval(async () => {
            const feeds: Array<IFeed> = await FeedStore.getAllFeeds(this.persisRead);
            if (feeds.length) {
                for (const feed of feeds) {
                    const messages: Array<IMessage> = await this.read(feed, this.persis, this.context, this.http);
                    if (messages.length) {
                        for (const message of messages) {
                            Messenger.notify(message, this.modify);
                        }
                    }
                }
            }
        }, 1000 * 60 * 20);
    }

    public async subscribe(url: string): Promise<void> {
        const message: IMessage = {
            room: this.room,
            sender: this.user,
            groupable: false,
        };

        try {
            const feed: IFeed = await FeedReader.getFeedInfo(url, this.http);
            await FeedStore.add(this.persis, message.room, feed);
            message.text = `Subscribed to feed ${feed.title} at ${feed.link}.`;
        } catch (err) {
            message.text = `Failed to subscribe to feed at ${url}.`;
            console.error(err);
        }

        Messenger.notify(message, this.modify);
    }

    public async list(): Promise<void> {
        const message: IMessage = {
            room: this.room,
            text: '',
            sender: this.user,
            groupable: false,
        };

        const feeds: Array<IFeed> = await FeedStore.getRoomFeeds(message.room, this.persisRead);

        if (feeds.length) {
            for (const feed of feeds) {
                message.text += `${feed.uuid}: ${feed.title} - ${feed.link}\n`;
            }
        } else {
            message.text = 'You have no feeds. Use `/rss subscribe <url>` to add one.';
        }

        Messenger.notify(message, this.modify);
    }

    public async remove(uuid: string): Promise<void> {
        const message: IMessage = {
            room: this.room,
            sender: this.user,
            groupable: false,
        };

        try {
            await FeedStore.remove(this.persis, message.room, uuid);
            message.text = `Removed feed with ID ${uuid}.`;
        } catch (err) {
            console.error(err);
            message.text = `Failed to remove feed with ID ${uuid}.`;
        }

        Messenger.notify(message, this.modify);
    }

    public help(): void {
        const text = `Commands: subscribe, remove, list, help
                     To subscribe to an RSS feed in this channel: \`/rss subscribe <url>\`
                     To list subscribed RSS feeds in this channel: \`/rss list\`
                     To remove an RSS feed from this channel: \`/rss remove <ID>\``;

        const message: IMessage = {
            room: this.room,
            sender: this.user,
            text,
            groupable: false,
        };

        Messenger.notify(message, this.modify);
    }

    private async read(feed: IFeed, persis: IPersistence, context: SlashCommandContext, http: IHttp): Promise<Array<IMessage>> {
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
