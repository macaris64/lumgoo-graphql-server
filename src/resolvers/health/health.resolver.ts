import type { ResolverFn, HealthResponse } from '../../generated/resolvers-types';
import type { Context } from '../../types/context';

/**
 * Health check resolver
 * Returns server health status, uptime, and timestamp
 */
export const healthResolver: ResolverFn<HealthResponse, {}, Context, {}> = async (
  _parent: unknown,
  _args: {},
  _context: Context,
  _info: unknown
): Promise<HealthResponse> => {
  return {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}; 