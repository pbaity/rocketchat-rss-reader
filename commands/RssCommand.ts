import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedManager } from '../lib/FeedManager';

export class RssCommand implements ISlashCommand {
    public command = 'rss';
    public i18nParamsExample = 'help, subscribe, remove, or list';
    public i18nDescription = 'Manage RSS subscriptions';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const [subcommand, target] = context.getArguments();

        switch (subcommand) {
            case 'list':
                await FeedManager.list(context, read.getPersistenceReader(), modify);
                break;
            case 'remove':
                await FeedManager.remove(target, context, persistence, modify);
                break;
            case 'subscribe':
                await FeedManager.subscribe(target, context, persistence, modify, http);
                break;
            default:
                await FeedManager.help(context, modify);
                break;
        }
    }
}
