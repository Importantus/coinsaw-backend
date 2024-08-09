import * as s from 'superstruct';

const timestamp = s.number();

export const getDataQuery = s.object({
    from: s.optional(timestamp),
    to: s.optional(timestamp),
});

export type getDataQueryType = s.Infer<typeof getDataQuery>;

