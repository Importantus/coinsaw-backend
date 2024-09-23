import * as s from 'superstruct';
import { logger } from '../utils/logger';

const timestamp = s.define<string>('timestamp', (value: string) => {
    logger.debug(`Validating timestamp: ${value}`);
    const date = new Date(parseInt(value));
    logger.debug(`Parsed date: ${date}`);
    return date instanceof Date && !isNaN(date.getTime());
});

export const getDataQuery = s.object({
    from: s.optional(timestamp),
    to: s.optional(timestamp),
});

export const syncDataQuery = s.object({
    lastSync: timestamp,
    data: s.array(s.any())
})

export type getDataQueryType = s.Infer<typeof getDataQuery>;
export type syncDataQueryType = s.Infer<typeof syncDataQuery>;

