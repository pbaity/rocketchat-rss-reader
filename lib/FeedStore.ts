import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
<<<<<<< HEAD
import { IFeed } from './IFeed';

export class FeedStore {
    public static async subscribe(persis: IPersistence, room: IRoom, feed: IFeed): Promise<boolean> {
        feed.uuid = (Math.ceil(Math.random() * Math.pow(10, 12)) + Math.pow(10, 12)).toString();
=======

export class FeedStore {
    public static async subscribe(persis: IPersistence, room: IRoom, url: string): Promise<boolean> {
        // TODO: validate the URL

        const uuid: string = (Math.ceil(Math.random() * Math.pow(10, 12)) + Math.pow(10, 12)).toString();
>>>>>>> 9c7e4a133ee75c224aa6cc91223f77be33be5a4a

        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
<<<<<<< HEAD
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, feed.url),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, feed.uuid),
        ];

        try {
            await persis.updateByAssociations(associations, feed, true);
=======
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, url),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, uuid),
        ];

        try {
            await persis.updateByAssociations(associations, { uuid, url }, true);
>>>>>>> 9c7e4a133ee75c224aa6cc91223f77be33be5a4a
        } catch (err) {
            console.warn(err);
            return false;
        }

        return true;
    }

<<<<<<< HEAD
    public static async list(persis: IPersistenceRead, room: IRoom): Promise<Array<IFeed>> {
=======
    public static async list(persis: IPersistenceRead, room: IRoom): Promise<Array<string>> {
>>>>>>> 9c7e4a133ee75c224aa6cc91223f77be33be5a4a
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
        ];

<<<<<<< HEAD
        const feeds: Array<IFeed> = [];

        try {
            const records: Array<IFeed> = (await persis.readByAssociations(associations)) as Array<IFeed>;

            if (records.length) {
                feeds.push.apply(feeds, records);
=======
        let feeds: Array<string> = [];
        try {
            const records: Array<{ url: string }> = (await persis.readByAssociations(associations)) as Array<{ url: string }>;

            if (records.length) {
                feeds = records.map(({ url }) => url);
>>>>>>> 9c7e4a133ee75c224aa6cc91223f77be33be5a4a
            }
        } catch (err) {
            console.warn(err);
        }

        return feeds;
    }

<<<<<<< HEAD
    public static async remove(persis: IPersistence, room: IRoom, uuid: string): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, uuid),
=======
    public static async remove(persis: IPersistence, room: IRoom, id: string): Promise<boolean> {
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'feed'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room.id),
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id),
>>>>>>> 9c7e4a133ee75c224aa6cc91223f77be33be5a4a
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
