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

export type getDataQueryType = s.Infer<typeof getDataQuery>;

