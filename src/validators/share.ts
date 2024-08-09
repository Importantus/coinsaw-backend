import * as s from 'superstruct';

const isAdmin = s.boolean();
const maxSessions = s.number();

export const createShareTokenQuery = s.object({
    admin: isAdmin,
    maxSessions: maxSessions
});

export type CreateShareTokenQueryType = s.Infer<typeof createShareTokenQuery>;