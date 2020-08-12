import { IAppAccessors, IConfigurationExtend, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { RssCommand } from './commands/RssCommand';

export class RssReaderApp extends App {
    private intervalReader: object;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.enable(accessors.http, accessors.reader);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        await configuration.settings.provideSetting({
            id : 'enabled-rooms',
            i18nLabel: 'Enabled Rooms',
            i18nDescription: 'A space-separated list of rooms to enable the RSS reader in (e.g.: "random general news")',
            required: true,
            type: SettingType.STRING,
            public: true,
            packageValue: 'random',
        });
        await configuration.slashCommands.provideSlashCommand(new RssCommand());
    }

    private enable(http: IHttp, reader: IRead) {
        return;
    }

    private disable(http: IHttp, reader: IRead) {
        return;
    }
}
