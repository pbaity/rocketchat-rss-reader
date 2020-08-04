import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';

export class FeedStore {
    public static async subscribe(persis: IPersistence, room: IRoom, url: string): Promise<boolean> {
        // TODO: validate the URL

        const uuid: string = (Math.ceil(Math.random() * Math.pow(10, 12)) + Math.pow(10, 12)).toString();

        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, url),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, uuid),
        ];

        try {
            await persis.updateByAssociations(associations, { uuid, url }, true);
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }

    public static async list(persis: IPersistenceRead, room: IRoom): Promise<Array<string>> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
        ];

        let feeds: Array<string> = [];
        try {
            const records: Array<{ url: string }> = (await persis.readByAssociations(associations)) as Array<{ url: string }>;

            if (records.length) {
                feeds = records.map(({ url }) => url);
            }
        } catch (err) {
            console.warn(err);
        }

        return feeds;
    }

    public static async remove(persis: IPersistence, room: IRoom, id: string): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id),
        ];

        try {
            await persis.removeByAssociations(associations);
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }
}
