import type { ResolverFn, HealthResponse } from '../../generated/resolvers-types';
import type { Context } from '../../types/context';

/**
 * Health check resolver
 * Returns server health status, uptime, and timestamp
 */
export const healthResolver: ResolverFn<HealthResponse, {}, Context, {}> = async (
  _parent,
  _args,
  _context,
  _info
) => {
  return {
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}; 