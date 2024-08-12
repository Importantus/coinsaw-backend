import * as express from 'express'
import h from '../../utils/errorHelper'
import { createSession, deleteSession, getSessions } from '../../models/session';
import { adminAuth } from '../../middleware/auth';
import { Session } from '../../entity/Session';
import { assert } from 'superstruct';
import { createSessionQuery } from '../../validators/session';
import APIError from '../../utils/apiError';

const router = express.Router()

router.post("/", h(async (req, res) => {

    try {
        assert(req.body, createSessionQuery);
    } catch (error) {
        throw APIError.badRequest(error);
    }

    const [session, sessionToken] = (await createSession(req.body)) as [Session, string];

    delete session.group.recoveryToken;
    delete session.share;

    res.status(201).json({
        ...session,
        token: sessionToken
    });
}));

router.get("/", adminAuth, h(async (req, res) => {

    const sessions = await getSessions(res.locals.groupId);

    res.status(200).json(sessions);
}));

// TODO: Allow users to delete their own session
router.delete("/:id", adminAuth, h(async (req, res) => {
    const id = req.params.id;

    await deleteSession(id, res.locals.groupId);

    res.status(204).json();
}));

export default router;