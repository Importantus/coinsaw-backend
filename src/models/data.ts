import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { Entry } from "../entity/Entry";
import { getDataQueryType } from "../validators/data";
import APIError from "../utils/apiError";
import { broadcast } from "../routes/v1/realtime";
import { logger } from "../utils/logger";

export async function getDataFromGroup(groupId: string, query: getDataQueryType) {
    logger.debug(`Getting data from group ${groupId}`);

    const entryRepository = AppDataSource.getRepository(Entry);

    const startDate = query.from ? new Date(parseInt(query.from)) : new Date(0);
    const endDate = query.to ? new Date(parseInt(query.to)) : new Date();

    if (startDate && endDate && startDate > endDate) {
        throw APIError.badRequest("From date is greater than to date");
    }

    const data = await entryRepository.find({
        select: ["payload"],
        where: {
            group: {
                id: groupId
            },
            syncTimestamp: Between(startDate, endDate)
        },
        order: {
            creationTimestamp: "DESC"
        }
    });

    return data.map((entry) => {
        return JSON.parse(entry.payload)
    })

}

export async function createData(groupId: string, payload: any): Promise<string[]> {
    logger.debug(`Creating data for group ${groupId}`);

    const entryRepository = AppDataSource.getRepository(Entry);

    try {
        const entries = payload
        const savedEntryIds = [];

        if (!Array.isArray(entries)) {
            throw Error();
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.id || !entry.timestamp || entry.groupId !== groupId) {
                throw Error();
            } else {
                broadcast(groupId, JSON.stringify(entry));
                const entryDB = await Entry.factory(entry.id, new Date(entry.timestamp), entry.groupId, JSON.stringify(entry));
                savedEntryIds.push(entry.id);
                try {
                    await entryRepository.insert(entryDB);
                } catch (err) {
                    if (err.code === '23505') {
                        // Duplicate key error
                        logger.info(`Entry with id ${entry.id} already exists in the database and is being skipped`);
                    } else {
                        throw err;
                    }
                }
            }
        }

        return savedEntryIds;
    } catch (err) {
        logger.error(err);
        throw APIError.badRequest("Wrong payload format");
    }
}