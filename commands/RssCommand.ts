import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedManager } from '../lib/FeedManager';

export class RssCommand implements ISlashCommand {
    public command = 'rss';
    public i18nParamsExample = 'help, subscribe, remove, or list';
    public i18nDescription = 'Manage RSS feeds';
    public providesPreview = false;
    private appId: string;

    constructor(appId: string) {
        this.appId = appId;
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const [subcommand, target] = context.getArguments();
        const feedManager: FeedManager = new FeedManager(this.appId, context, persistence, read, http, modify);

        switch (subcommand) {
            case 'list':
                await feedManager.list();
                break;
            case 'remove':
                await feedManager.remove(target);
                break;
            case 'subscribe':
                await feedManager.subscribe(target);
                break;
            default:
                await feedManager.help();
                break;
        }
    }
}
