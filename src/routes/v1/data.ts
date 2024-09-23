import * as express from 'express'
import h from '../../utils/errorHelper'
import { assert } from 'superstruct';
import { getDataQuery, syncDataQuery } from '../../validators/data';
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

router.post("/sync", h(async (req, res) => {
    const request = req.body;

    try {
        assert(request, syncDataQuery);
    } catch (error) {
        throw APIError.badRequest(error);
    }

    const createdEntries = await createData(res.locals.groupId, request.data);
    const data = await getDataFromGroup(res.locals.groupId, { from: request.lastSync, to: "" });

    // Filter out all doublicates between createdEntries and data
    const filteredData = data.filter((entry) => {
        return !createdEntries.some((createdEntry) => {
            return createdEntry === entry.id;
        });
    });

    res.status(createdEntries.length > 0 ? 201 : 200).json(filteredData);
}));

export default router;