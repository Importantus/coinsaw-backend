import * as express from 'express'
import h from '../../utils/errorHelper'
import { createGroup, deleteGroup } from '../../models/group';

const router = express.Router()

router.post("/", h(async (req, res) => {
    const id = req.body.id;

    const group = await createGroup(id);

    res.status(201).json(group);
}));

router.delete("/:id", h(async (req, res) => {
    const id = req.params.id;

    await deleteGroup(id);

    res.status(204).json();
}));

export default router;