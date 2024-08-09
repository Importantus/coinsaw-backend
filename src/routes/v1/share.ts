import * as express from 'express'
import h from '../../utils/errorHelper'
import { assert } from 'superstruct';
import { createShareTokenQuery } from '../../validators/share';
import APIError from '../../utils/apiError';
import { createShareToken, deactivateShareToken, getShareTokens } from '../../models/share';

const router = express.Router()

router.post("/", h(async (req, res) => {
    try {
        assert(req.body, createShareTokenQuery);
    } catch (error) {
        throw APIError.badRequest(error);
    }

    const shareToken = await createShareToken(res.locals.groupId, req.body);

    res.status(201).json(shareToken);
}));

router.get("/", h(async (req, res) => {
    res.status(200).json(await getShareTokens(res.locals.groupId));
}));

router.delete("/:id", h(async (req, res) => {
    await deactivateShareToken(req.params.id);
    res.status(204).json();
}));

export default router;