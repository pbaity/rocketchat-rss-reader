import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessage } from '@rocket.chat/apps-engine/definition/messages';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { FeedManager } from '../lib/FeedManager';
import { sendNotification } from '../lib/send';

export class RssCommand implements ISlashCommand {
    public command = 'rss';
    public i18nParamsExample = 'help, subscribe, remove, or list';
    public i18nDescription = 'Manage RSS subscriptions';
    public providesPreview = false;

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence): Promise<void> {
        const [subcommand, target] = context.getArguments();
        let message: IMessage;

        switch (subcommand) {
            case 'list':
                message = await FeedManager.list(context, read.getPersistenceReader());
                break;
            case 'remove':
                message = await FeedManager.remove(target, context, persistence);
                break;
            case 'subscribe':
                message = await FeedManager.subscribe(target, context, persistence, http);
                break;
            default:
                message = await FeedManager.help(context);
                break;
        }

        sendNotification(message, modify);
    }
}
