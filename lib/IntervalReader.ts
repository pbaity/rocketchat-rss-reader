import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { FeedReader } from './FeedReader';
import { FeedStore } from './FeedStore';
import { IFeed } from './IFeed';
import { IFeedItem } from './IFeedItem';
import { Messenger } from './Messenger';

export class IntervalReader {
    private persis: IPersistence;
    private read: IRead;
    private http: IHttp;
    private modify: IModify;
    private intervalTime: number;
    private interval: ReturnType<typeof setInterval>;
    private appUser: IUser | undefined;

    constructor(appID: string, read: IRead, http: IHttp) {
        this.read = read;
        this.http = http;
        this.initialize(appID);
        this.enable();
    }

    public enable(): void {
        this.interval = setInterval(async () => {
            this.intervalTime = (await this.read.getEnvironmentReader().getSettings().getById('tenor_show_title')).value;
            this.readFeeds();
        }, 1000 * 60 * this.intervalTime);
    }

    public disable(): void {
        clearInterval(this.interval);
    }

    private async initialize(appID: string) {
        this.appUser = await this.read.getUserReader().getAppUser(appID);
    }

    private async readFeeds(): Promise<void> {
        if (this.appUser) {
            const feeds: Array<IFeed> = await FeedStore.getAllFeeds(this.read.getPersistenceReader());
            if (feeds.length) {
                for (const feed of feeds) {
                    const messages: Array<IMessage> = [];
                    const newItems: Array<IFeedItem> = await FeedReader.getNewFeedItems(feed, this.http);

                    if (newItems.length) {
                        feed.lastItemLink = newItems[0].link;
                        FeedStore.update(this.persis, feed);
                        for (const item of newItems) {
                            messages.push({
                                room: feed.room,
                                sender: this.appUser,
                                groupable: false,
                                text: `${item.title}\n${item.link}`,
                            });
                        }
                    }
                    if (messages.length) {
                        for (const message of messages) {
                            Messenger.notify(message, this.modify);
                        }
                    }
                }
            }
        } else {
            console.error('Could not get the AppUser!!!');
        }
    }
}
