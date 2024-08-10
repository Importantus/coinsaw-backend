import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { AppDataSource } from "../data-source";
import { Share } from "../entity/Share";
import APIError from "../utils/apiError";
import { Session } from "../entity/Session";
import { ShareTokenJWT } from "../types";
import { logger } from "../utils/logger";
import { Group } from "../entity/Group";
import * as argon2 from "argon2";

async function validateToken(token: string): Promise<Share | Group> {
    const decoded = jwt.verify(token, environment.jwtSecret) as ShareTokenJWT;

    logger.debug(JSON.stringify(decoded));

    const shareRepository = AppDataSource.getRepository(Share);
    const share = await shareRepository.findOne({
        relations: ["sessions", "group"],
        where: {
            id: decoded.tokenId,
            group: {
                id: decoded.groupId
            }
        }
    });

    if (share && share.active && share.sessions.length < share.maxSessions) {
        // If with the new session the max sessions would be reached, deactivate the share
        if (share.sessions.length + 1 >= share.maxSessions) {
            share.active = false;
            await shareRepository.save(share);
        }
        return share;
    } else {
        const groupRepository = AppDataSource.getRepository(Group);
        const group = await groupRepository.findOne({
            where: {
                id: decoded.groupId
            }
        });

        if (group && await argon2.verify(group.recoveryToken, token)) {
            return group;
        } else {
            throw APIError.forbidden();
        }
    }
}

export async function createSession(shareToken: string) {
    logger.debug(`Creating new session`);

    const shareOrGroup = await validateToken(shareToken);

    const sessionTokenRepository = AppDataSource.getRepository(Session);
    const [session, token] = Session.factory(shareOrGroup);

    await sessionTokenRepository.save(session);

    return [session, token];
}

export async function getSessions(groupId: string): Promise<Session[]> {
    logger.debug(`Getting sessions for group ${groupId}`);

    const sessionRepository = AppDataSource.getRepository(Session);

    return await sessionRepository.find({
        where: {
            group: {
                id: groupId
            }
        }
    });
}

export async function deleteSession(id: string, groupId: string) {
    logger.debug(`Deleting session with id ${id}`);

    const sessionRepository = AppDataSource.getRepository(Session);

    const session = await sessionRepository.findOne({
        where: {
            id,
            group: {
                id: groupId
            }
        }
    });

    if (!session) {
        throw APIError.notFound();
    }

    await sessionRepository.remove(session);
}