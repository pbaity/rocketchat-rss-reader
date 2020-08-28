import { IAppAccessors, IConfigurationExtend, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { RssCommand } from './commands/RssCommand';
import { IntervalReader } from './lib/IntervalReader';

export class RssReaderApp extends App {
    private intervalReader: IntervalReader;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);

        this.intervalReader = new IntervalReader(info.id, accessors.reader, accessors.http);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        await configuration.settings.provideSetting({
            id : 'enabled-rooms',
            i18nLabel: 'Enabled Rooms',
            i18nDescription: 'A space-separated list of rooms to enable the RSS reader in (e.g.: "random general news")',
            i18nPlaceholder: 'random general news',
            required: true,
            type: SettingType.STRING,
            public: true,
            packageValue: 'random',
        });
        await configuration.settings.provideSetting({
            id : 'read-interval',
            i18nLabel: 'Feed Read Interval',
            i18nDescription: 'How often (in minutes) your feeds should be checked for new items',
            i18nPlaceholder: '20',
            required: true,
            type: SettingType.NUMBER,
            public: true,
            packageValue: 20,
        });
        await configuration.slashCommands.provideSlashCommand(new RssCommand());
    }
}
