import { healthResolver } from './health/health.resolver';
import type { Resolvers } from '../generated/resolvers-types';

/**
 * Combined GraphQL resolvers
 */
export const resolvers: Resolvers = {
  Query: {
    health: healthResolver,
  },
};
