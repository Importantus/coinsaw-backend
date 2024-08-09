import * as express from 'express'
import h from '../../utils/errorHelper'
import { createSession, deleteSession, getSessions } from '../../models/session';
import { adminAuth } from '../../middleware/auth';

const router = express.Router()

router.post("/", h(async (req, res) => {
    const token = req.headers.authorization!.split(" ")[1];

    const session = await createSession(token)

    res.status(201).json(session);
}));

router.get("/", adminAuth, h(async (req, res) => {

    const sessions = await getSessions(res.locals.groupId);

    res.status(200).json(sessions);
}));

// TODO: Allow users to delete their own session
router.delete("/:id", adminAuth, h(async (req, res) => {
    const id = req.params.id;

    await deleteSession(id);

    res.status(204).json();
}));

export default router;