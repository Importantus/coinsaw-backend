import { Between } from "typeorm";
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

    logger.debug(`Getting data from ${startDate} to ${endDate}`);

    const data = await entryRepository.find({
        select: ["payload"],
        where: {
            group: {
                id: groupId
            },
            syncTimestamp: Between(startDate, endDate)
        }
    });

    return data.map((entry) => {
        return JSON.parse(entry.payload)
    })

}

export async function createData(groupId: string, payload: string) {
    logger.debug(`Creating data for group ${groupId}`);

    const entryRepository = AppDataSource.getRepository(Entry);

    try {
        const entries = payload

        if (!Array.isArray(entries)) {
            throw Error();
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.id || !entry.timestamp || entry.groupId !== groupId) {
                throw Error();
            } else {
                logger.debug(new Date(entry.timestamp))
                broadcast(groupId, JSON.stringify(entry));
                const entryDB = await Entry.factory(entry.id, new Date(entry.timestamp), entry.groupId, JSON.stringify(entry));
                await entryRepository.save(entryDB);
            }
        }

    } catch (err) {
        logger.error(err);
        throw APIError.badRequest("Wrong payload format");
    }
}