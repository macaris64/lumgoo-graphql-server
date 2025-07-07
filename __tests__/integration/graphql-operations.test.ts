import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { typeDefs } from '../../src/schema';
import { resolvers } from '../../src/resolvers';
import type { Context } from '../../src/types/context';
import type { GraphQLError } from 'graphql';

// Test-specific types
interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
}

interface GraphQLTestResponse {
  health?: HealthResponse;
  __schema?: {
    types: Array<{ name: string }>;
  };
}

interface GraphQLErrorResponse {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

describe('GraphQL Integration Tests', () => {
  let testServer: ApolloServer<Context>;

  beforeAll(async () => {
    testServer = new ApolloServer<Context>({
      typeDefs,
      resolvers,
    });
  });

  afterAll(async () => {
    await testServer?.stop();
  });

  describe('Health Query', () => {
    it('should execute health query successfully', async () => {
      // Given
      const query = gql`
        query {
          health {
            status
            uptime
            timestamp
          }
        }
      `;

      // When
      const response = await testServer.executeOperation({
        query,
      });

      // Then
      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.health).toBeDefined();
        const health = response.body.singleResult.data?.health as HealthResponse;
        expect(health.status).toBe('UP');
        expect(typeof health.uptime).toBe('number');
        expect(health.uptime).toBeGreaterThan(0);
        expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });

    it('should handle health query with specific fields', async () => {
      // Given
      const query = gql`
        query {
          health {
            status
          }
        }
      `;

      // When
      const response = await testServer.executeOperation({
        query,
      });

      // Then
      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        const health = response.body.singleResult.data?.health as HealthResponse;
        expect(health.status).toBe('UP');
        expect(health.uptime).toBeUndefined();
        expect(health.timestamp).toBeUndefined();
      }
    });
  });

  describe('Schema Validation', () => {
    it('should have valid GraphQL schema', async () => {
      // Given
      const introspectionQuery = gql`
        query {
          __schema {
            types {
              name
            }
          }
        }
      `;

      // When
      const response = await testServer.executeOperation({
        query: introspectionQuery,
      });

      // Then
      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeUndefined();
        expect(response.body.singleResult.data?.__schema).toBeDefined();
      }
    });

    it('should reject invalid queries', async () => {
      // Given
      const invalidQuery = gql`
        query {
          nonExistentField
        }
      `;

      // When
      const response = await testServer.executeOperation({
        query: invalidQuery,
      });

      // Then
      expect(response.body.kind).toBe('single');
      if (response.body.kind === 'single') {
        expect(response.body.singleResult.errors).toBeDefined();
        const errors = response.body.singleResult.errors as GraphQLError[];
        expect(errors).toHaveLength(1);
        expect(errors[0]?.message).toContain('Cannot query field "nonExistentField"');
      }
    });
  });
}); 