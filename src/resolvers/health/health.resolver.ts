import type {
  ResolverFn,
  HealthResponse,
} from '../../generated/resolvers-types';
import type { Context } from '../../types/context';
import type { GraphQLResolveInfo } from 'graphql';

// Resolver parameter types
interface EmptyParentType {
  // GraphQL parent object - empty for root queries
}

interface EmptyArgsType {
  // No arguments expected for health query
}

/**
 * Health check resolver
 * Returns server health status, uptime, and timestamp
 */
export const healthResolver: ResolverFn<
  HealthResponse,
  EmptyParentType,
  Context,
  EmptyArgsType
> = async (
  _parent: EmptyParentType,
  _args: EmptyArgsType,
  _context: Context,
  _info: GraphQLResolveInfo
): Promise<HealthResponse> => {
  return {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};
