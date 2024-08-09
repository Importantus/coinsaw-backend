import { Between } from "typeorm";
import { AppDataSource } from "../data-source";
import { Entry } from "../entity/Entry";
import { getDataQueryType } from "../validators/data";
import APIError from "../utils/apiError";
import { broadcast } from "../routes/v1/realtime";

export async function getDataFromGroup(groupId: string, query: getDataQueryType) {
    const entryRepository = AppDataSource.getRepository(Entry);

    const startDate = query.from ? new Date(query.from) : new Date(0);
    const endDate = query.to ? new Date(query.to) : new Date();

    return await entryRepository.find({
        where: {
            group: {
                id: groupId
            },
            syncTimestamp: Between(startDate, endDate)
        }
    });
}

export async function createData(groupId: string, payload: string) {
    const entryRepository = AppDataSource.getRepository(Entry);

    try {
        const entries = JSON.parse(payload);

        if (!Array.isArray(entries)) {
            throw Error();
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            if (!entry.id || !entry.creationTimestamp) {
                throw Error();
            } else {
                broadcast(groupId, entry);
                const entryDB = new Entry(entry.id, new Date(entry.timestamp), JSON.stringify(entry));
                await entryRepository.save(entryDB);
            }
        }

    } catch {
        throw APIError.badRequest("Wrong payload format");
    }
}