import * as express from 'express'
import h from '../../utils/errorHelper'
import { createSession, deleteSession, getSessions } from '../../models/session';
import { adminAuth } from '../../middleware/auth';
import { Session } from '../../entity/Session';

const router = express.Router()

router.post("/", h(async (req, res) => {
    const token = req.body.token;

    const [session, sessionToken] = (await createSession(token)) as [Session, string];

    delete session.group;
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