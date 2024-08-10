import * as express from 'express'
import h from '../../utils/errorHelper'
import { assert } from 'superstruct';
import { getDataQuery } from '../../validators/data';
import APIError from '../../utils/apiError';
import { createData, getDataFromGroup } from '../../models/data';

const router = express.Router()

router.get("/", h(async (req, res) => {
    try {
        assert(req.query, getDataQuery)
    } catch (error) {
        throw APIError.badRequest(error);
    }

    const data = await getDataFromGroup(res.locals.groupId, req.query);

    res.status(200).json(data);
}));

router.post("/", h(async (req, res) => {
    const data = req.body;

    await createData(res.locals.groupId, data);

    res.status(201).json();
}));

export default router;