import { IHttp, IModify, IPersistence, IPersistenceRead, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedStore } from '../lib/FeedStore';
import { help } from '../lib/Help';

export class RssCommand implements ISlashCommand {
    public command = 'rss';
    public i18nParamsExample = 'help, subscribe, remove, or list';
    public i18nDescription = 'Manage RSS subscriptions';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const [subcommand, target] = context.getArguments();

        switch (subcommand) {
            case 'list':
                await FeedStore.list(read.getPersistenceReader(), context.getRoom());
                break;
            case 'remove':
                await FeedStore.remove(persistence, context.getRoom(), target);
                break;
            case 'subscribe':
                await FeedStore.subscribe(persistence, context.getRoom(), target);
                break;
            default:
                await help(context, modify);
                break;
        }
    }
}
