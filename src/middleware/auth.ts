import { Request, Response, NextFunction } from "express";
import APIError from "../utils/apiError";
import * as jwt from "jsonwebtoken";
import { environment } from "../utils/environment";
import { AppDataSource } from "../data-source";
import { Session } from "../entity/Session";
import { SessionTokenJWT } from "../types";
import { logger } from "../utils/logger";

async function getSessionExpress(req: Request) {
    const token = req.headers.authorization!.split(" ")[1];

    return await getSession(token);
}

export async function getSession(token: string) {

    const decoded = jwt.verify(token, environment.jwtSecret) as SessionTokenJWT;

    const session = await AppDataSource.getRepository(Session).findOne({
        relations: ["group"],
        where: {
            id: decoded.tokenId,
            group: {
                id: decoded.groupId
            }
        }
    });

    if (session) {
        updateLastActive(session);
    }

    return session;
}

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await getSessionExpress(req);

        if (session && session.admin) {
            res.locals.groupId = session.group.id;
            next();
        } else {
            next(APIError.forbidden());
        }
    } catch (err) {
        logger.error(err);
        next(APIError.forbidden())
    }
}

export async function privateAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const session = await getSessionExpress(req);

        if (session) {
            res.locals.groupId = session.group.id;
            next();
        } else {
            next(APIError.notAuthorized());
        }
    } catch {
        next(APIError.notAuthorized())
    }
}

async function updateLastActive(session: Session) {
    session.last_active_timestamp = new Date();
    await AppDataSource.getRepository(Session).save(session);
}