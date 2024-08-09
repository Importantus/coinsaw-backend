import { AppDataSource } from "../data-source";
import { Group } from "../entity/Group";
import { ShareToken } from "../entity/ShareToken";
import APIError from "../utils/apiError";
import { CreateShareTokenQueryType } from "../validators/share";

export async function createShareToken(groupId: string, query: CreateShareTokenQueryType): Promise<ShareToken> {
    const groupRepository = AppDataSource.getRepository(Group);
    const shareTokenRepository = AppDataSource.getRepository(ShareToken);

    const group = await groupRepository.findOne({
        where: {
            id: groupId
        }
    });

    if (!group) {
        throw APIError.badRequest("Group not found");
    }

    const shareToken = new ShareToken(group, query.admin, query.maxSessions);

    await shareTokenRepository.save(shareToken);

    return shareToken;
}

export async function getShareTokens(groupId: string): Promise<ShareToken[]> {
    const shareTokenRepository = AppDataSource.getRepository(ShareToken);

    return await shareTokenRepository.find({
        where: {
            group: {
                id: groupId
            }
        }
    });
}

export async function deactivateShareToken(id: string) {
    const shareTokenRepository = AppDataSource.getRepository(ShareToken);

    const shareToken = await shareTokenRepository.findOne({
        where: {
            id
        }
    });

    if (!shareToken) {
        throw APIError.notFound();
    }

    shareToken.active = false;

    await shareTokenRepository.save(shareToken);
}