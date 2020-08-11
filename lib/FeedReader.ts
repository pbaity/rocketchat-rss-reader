import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { IFeed } from './IFeed';
import { IFeedItem } from './IFeedItem';

export class FeedReader {
    public static async getFeedInfo(url: string, http: IHttp): Promise<IFeed> {
        try {
            const response = await http.get(url);
            const xml = response.content;
            return this.parseChannelDetails(xml!);
        } catch (err) {
            throw new Error('Could not get feed info: ' + err);
        }
    }

    public static async getFeedItems(feed: IFeed, http: IHttp): Promise<Array<IFeedItem>> {
        try {
            const response = await http.get(feed.link);
            const xml = response.content;
            return this.parseFeedItems(xml!);
        } catch (err) {
            throw new Error('Could not get feed items: ' + err);
        }
    }

    private static parseChannelDetails(xml: string): IFeed {
        const titleReg = xml.match(/<channel>.*?<title>(.*?)<\/title>/ms);
        const linkReg = xml.match(/<channel>.*?<link>(.*?)<\/link>/ms);
        const descReg = xml.match(/<channel>.*?<description>(.*?)<\/description>/ms);

        const title = titleReg && titleReg.length ? titleReg[0] : undefined;
        const link = linkReg && linkReg.length ? linkReg[0] : undefined;
        const description = descReg && descReg.length ? descReg[0] : undefined;

        if (title && link && description) {
            return {
                title,
                link,
                description,
            };
        } else {
            throw new Error('Failed to read RSS channel details.');
        }
    }

    private static parseFeedItems(xml: string): Array<IFeedItem> {
        const items: Array<IFeedItem> = [];
        const itemReg = xml.match(/<item>.*?<\/item>/gms);

        if (!itemReg) {
            throw new Error('Could not parse feed items.');
        }

        for (const itemMatch of itemReg) {
            const itemDetails = itemMatch.length ? itemMatch[0] : undefined;
            if (itemDetails) {
                const item = this.parseItemDetails(itemDetails);
                items.push(item);
            }
        }

        return items;
    }

    private static parseItemDetails(itemXml: string): IFeedItem {
        const titleReg = itemXml.match(/<title>(.*?)<\/title>/ms);
        const linkReg = itemXml.match(/<link>(.*?)<\/link>/ms);
        const descReg = itemXml.match(/<description>(.*?)<\/description>/ms);
        const pubDateReg = itemXml.match(/<pubDate>(.*?)<\/pubDate>/ms);

        const title = titleReg && titleReg.length ? titleReg[0] : undefined;
        const link = linkReg && linkReg.length ? linkReg[0] : undefined;
        const description = descReg && descReg.length ? descReg[0] : undefined;
        const pubDate = pubDateReg && pubDateReg.length ? new Date(pubDateReg[0]) : undefined;

        if (title && link && description) {
            return {
                title,
                link,
                description,
                pubDate,
            };
        } else {
            throw new Error('Failed to read channel item details.');
        }
    }
}
