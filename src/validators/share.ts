import * as s from 'superstruct';

const name = s.size(s.string(), 1, 75);
const isAdmin = s.boolean();
const maxSessions = s.number();

export const createShareTokenQuery = s.object({
    name: name,
    admin: isAdmin,
    maxSessions: maxSessions
});

export type CreateShareTokenQueryType = s.Infer<typeof createShareTokenQuery>;