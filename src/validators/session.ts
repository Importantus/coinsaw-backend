import * as s from 'superstruct';

const name = s.size(s.string(), 1, 75);
const token = s.string();

export const createSessionQuery = s.object({
    name: name,
    token: token
});

export type CreateSessionQueryType = s.Infer<typeof createSessionQuery>;