import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { AppDataSource } from "../data-source";
import { ShareToken } from "../entity/ShareToken";
import APIError from "../utils/apiError";
import { Session } from "../entity/Session";


export async function createSession(shareToken: string) {
    const decoded = jwt.verify(shareToken, environment.jwtSecret) as ShareTokenJWT;

    // Get ShareToken from DB
    const shareTokenRepository = AppDataSource.getRepository(ShareToken);
    const shareTokenDB = await shareTokenRepository.findOne({
        where: {
            id: decoded.tokenId,
            group: {
                id: decoded.groupId
            }
        }
    });

    // Check if num of active sessions is less than maxSessions and if ShareToken is active
    if (shareToken && shareTokenDB.active && shareTokenDB.sessions.length < shareTokenDB.maxSessions) {
        // Create new session
        const sessionTokenRepository = AppDataSource.getRepository(Session);
        const session = new Session(shareTokenDB);

        return await sessionTokenRepository.save(session);
    } else {
        throw APIError.forbidden();
    }
}

export async function getSessions(groupId: string): Promise<Session[]> {
    const sessionRepository = AppDataSource.getRepository(Session);

    return await sessionRepository.find({
        where: {
            group: {
                id: groupId
            }
        }
    });
}

export async function deleteSession(id: string) {
    const sessionRepository = AppDataSource.getRepository(Session);

    const session = await sessionRepository.findOne({
        where: {
            id
        }
    });

    if (!session) {
        throw APIError.notFound();
    }

    await sessionRepository.remove(session);
}