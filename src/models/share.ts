import { AppDataSource } from "../data-source";
import { Group } from "../entity/Group";
import { Share } from "../entity/Share";
import APIError from "../utils/apiError";
import { logger } from "../utils/logger";
import { CreateShareTokenQueryType } from "../validators/share";
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { ShareTokenJWT } from "../types";

function generateTokenForShare(share: Share): string {
    const shareTokenContent: ShareTokenJWT = {
        groupId: share.group.id,
        server: environment.externalUrl,
        tokenId: share.id
    }

    return jwt.sign(shareTokenContent, environment.jwtSecret);
}

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

    const share = Share.factory(group, query.admin, query.maxSessions);

    await shareTokenRepository.save(share);

    return [share, generateTokenForShare(share)];
}

export async function getShareTokens(groupId: string): Promise<Share[]> {
    logger.debug(`Getting share tokens for group ${groupId}`);

    const shareTokenRepository = AppDataSource.getRepository(Share);

    return await shareTokenRepository.find({
        relations: ["sessions", "group"],
        where: {
            group: {
                id: groupId
            }
        }
    });
}

export async function getShareWithToken(id: string, groupId: string): Promise<[Share, string]> {
    logger.debug(`Getting share token with id ${id}`);

    const shareTokenRepository = AppDataSource.getRepository(Share);

    const shareToken = await shareTokenRepository.findOne({
        relations: ["sessions", "group"],
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

    return [shareToken, generateTokenForShare(shareToken)];
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