import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load GraphQL schema file
 */
const loadSchema = (filename: string): string => {
  return readFileSync(join(__dirname, filename), 'utf8');
};

/**
 * Combined GraphQL type definitions
 */
export const typeDefs = [
  loadSchema('base.graphql'),
  loadSchema('health.graphql'),
].join('\n'); 