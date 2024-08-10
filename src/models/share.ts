import { AppDataSource } from "../data-source";
import { Group } from "../entity/Group";
import { Share } from "../entity/Share";
import APIError from "../utils/apiError";
import { logger } from "../utils/logger";
import { CreateShareTokenQueryType } from "../validators/share";

export async function createShareToken(groupId: string, query: CreateShareTokenQueryType): Promise<[Share, string]> {
    logger.debug(`Creating share token for group ${groupId}`);

    const groupRepository = AppDataSource.getRepository(Group);
    const shareTokenRepository = AppDataSource.getRepository(Share);

    const group = await groupRepository.findOne({
        where: {
            id: groupId
        }
    });

    if (!group) {
        throw APIError.badRequest("Group not found");
    }

    const [share, token] = Share.factory(group, query.admin, query.maxSessions);

    await shareTokenRepository.save(share);

    return [share, token];
}

export async function getShareTokens(groupId: string): Promise<Share[]> {
    logger.debug(`Getting share tokens for group ${groupId}`);

    const shareTokenRepository = AppDataSource.getRepository(Share);

    return await shareTokenRepository.find({
        relations: ["sessions"],
        where: {
            group: {
                id: groupId
            }
        }
    });
}

export async function deactivateShareToken(id: string, groupId: string): Promise<void> {
    logger.debug(`Deactivating share token with id ${id}`);

    const shareTokenRepository = AppDataSource.getRepository(Share);

    const shareToken = await shareTokenRepository.findOne({
        where: {
            id,
            group: {
                id: groupId
            }
        }
    });

    if (!shareToken) {
        throw APIError.notFound();
    }

    shareToken.active = false;

    await shareTokenRepository.save(shareToken);
}