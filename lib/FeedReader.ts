import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { parseStringPromise } from 'xml2js';
import { IFeed } from './IFeed';

export class FeedReader {
    public static async read(feed: IFeed, minutes: number, http: IHttp) {
        const response = await http.get('https://api.rss2json.com/v1/api.json?rss_url=' + (feed.url || feed.link));
        const rss = await parseStringPromise(response);
        console.log(rss);
    }
}
