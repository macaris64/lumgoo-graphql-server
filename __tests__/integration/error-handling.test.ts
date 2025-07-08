import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../src/schema';
import { resolvers } from '../../src/resolvers';
import { createGraphQLErrorFormatter } from '../../src/errors/error-handler';
import { AppError, ErrorCode } from '../../src/errors/app-error';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

interface GraphQLResponse {
  body: {
    kind: 'single';
    singleResult: {
      data?: Record<string, string | number | boolean>;
      errors?: readonly GraphQLFormattedError[];
    };
  };
}

interface ErrorResponse {
  message: string;
  extensions?: {
    code: string;
    category: string;
    details: Record<string, string | number | boolean>;
    timestamp: string;
  };
}

describe('Error Handling Integration Tests', () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      formatError: createGraphQLErrorFormatter(),
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('GraphQL Error Formatting', () => {
    it('should format AppError thrown in resolver', async () => {
      // Given
      const mockResolver = {
        Query: {
          testError: (): never => {
            throw new AppError('User not found', ErrorCode.NOT_FOUND, {
              userId: '123',
              resourceType: 'User',
            });
          },
        },
      };

      const testServer = new ApolloServer({
        typeDefs: `
          type Query {
            testError: String
          }
        `,
        resolvers: mockResolver,
        formatError: createGraphQLErrorFormatter(),
      });

      const query = `
        query {
          testError
        }
      `;

      // When
      const response = await testServer.executeOperation({ query }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.data?.testError).toBeNull();
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors?.length).toBe(1);

      const error = response.body.singleResult.errors?.[0] as ErrorResponse;
      expect(error.message).toBe('User not found');
      expect(error.extensions?.code).toBe('NOT_FOUND');
      expect(error.extensions?.category).toBe('CLIENT_ERROR');
      expect(error.extensions?.details).toEqual({
        userId: '123',
        resourceType: 'User',
      });
      expect(error.extensions?.timestamp).toBeDefined();
    });

    it('should mask server errors for clients', async () => {
      // Given
      const mockResolver = {
        Query: {
          testServerError: (): never => {
            throw new AppError('Database connection failed', ErrorCode.DATABASE_ERROR, {
              connection: 'prod-db-01',
              query: 'SELECT * FROM sensitive_table',
            });
          },
        },
      };

      const testServer = new ApolloServer({
        typeDefs: `
          type Query {
            testServerError: String
          }
        `,
        resolvers: mockResolver,
        formatError: createGraphQLErrorFormatter(),
      });

      const query = `
        query {
          testServerError
        }
      `;

      // When
      const response = await testServer.executeOperation({ query }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.data?.testServerError).toBeNull();
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors?.length).toBe(1);

      const error = response.body.singleResult.errors?.[0] as ErrorResponse;
      expect(error.message).toBe('Internal server error');
      expect(error.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.extensions?.category).toBe('SERVER_ERROR');
      expect(error.extensions?.details).toEqual({});
    });

    it('should handle generic errors thrown in resolver', async () => {
      // Given
      const mockResolver = {
        Query: {
          testGenericError: (): never => {
            throw new Error('Unexpected error occurred');
          },
        },
      };

      const testServer = new ApolloServer({
        typeDefs: `
          type Query {
            testGenericError: String
          }
        `,
        resolvers: mockResolver,
        formatError: createGraphQLErrorFormatter(),
      });

      const query = `
        query {
          testGenericError
        }
      `;

      // When
      const response = await testServer.executeOperation({ query }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.data?.testGenericError).toBeNull();
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors?.length).toBe(1);

      const error = response.body.singleResult.errors?.[0] as ErrorResponse;
      expect(error.message).toBe('Internal server error');
      expect(error.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.extensions?.category).toBe('SERVER_ERROR');
      expect(error.extensions?.details).toEqual({});
    });

    it('should handle GraphQL validation errors', async () => {
      // Given
      const testServer = new ApolloServer({
        typeDefs: `
          type Query {
            testQuery: String
          }
        `,
        resolvers: {
          Query: {
            testQuery: () => 'success',
          },
        },
        formatError: createGraphQLErrorFormatter(),
      });

      const invalidQuery = `
        query {
          nonExistentField
        }
      `;

      // When
      const response = await testServer.executeOperation({ query: invalidQuery }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.data).toBeUndefined();
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors?.length).toBe(1);

      const error = response.body.singleResult.errors?.[0] as ErrorResponse;
      expect(error.message).toContain('Cannot query field');
      expect(error.extensions?.code).toBe('VALIDATION_ERROR');
      expect(error.extensions?.category).toBe('CLIENT_ERROR');
    });
  });

  describe('Health Query with Error Handling', () => {
    it('should return health status successfully', async () => {
      // Given
      const query = `
        query {
          health {
            status
            uptime
            timestamp
          }
        }
      `;

      // When
      const response = await server.executeOperation({ query }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.errors).toBeUndefined();
      expect(response.body.singleResult.data?.health).toBeDefined();
      expect(typeof response.body.singleResult.data?.health).toBe('object');
    });

    it('should handle malformed health query gracefully', async () => {
      // Given
      const malformedQuery = `
        query {
          health {
            nonExistentField
          }
        }
      `;

      // When
      const response = await server.executeOperation({ query: malformedQuery }) as unknown as GraphQLResponse;

      // Then
      expect(response.body.singleResult.data).toBeUndefined();
      expect(response.body.singleResult.errors).toBeDefined();
      expect(response.body.singleResult.errors?.length).toBe(1);

      const error = response.body.singleResult.errors?.[0] as ErrorResponse;
      expect(error.message).toContain('Cannot query field');
      expect(error.extensions?.code).toBe('VALIDATION_ERROR');
      expect(error.extensions?.category).toBe('CLIENT_ERROR');
    });
  });

  describe('Error Utilities Integration', () => {
    it('should provide proper error structure for different error types', async () => {
      // Given
      const testCases = [
        {
          name: 'validation error',
          resolver: () => {
            throw new AppError('Invalid email format', ErrorCode.VALIDATION_ERROR, {
              field: 'email',
              value: 'invalid-email',
            });
          },
          expectedMessage: 'Invalid email format',
          expectedCode: 'VALIDATION_ERROR',
          expectedCategory: 'CLIENT_ERROR',
        },
        {
          name: 'not found error',
          resolver: () => {
            throw new AppError('User not found', ErrorCode.NOT_FOUND, {
              resourceType: 'User',
              resourceId: '123',
            });
          },
          expectedMessage: 'User not found',
          expectedCode: 'NOT_FOUND',
          expectedCategory: 'CLIENT_ERROR',
        },
        {
          name: 'unauthorized error',
          resolver: () => {
            throw new AppError('Unauthorized access', ErrorCode.UNAUTHORIZED, {
              reason: 'Invalid token',
            });
          },
          expectedMessage: 'Unauthorized access',
          expectedCode: 'UNAUTHORIZED',
          expectedCategory: 'CLIENT_ERROR',
        },
      ];

      // When & Then
      for (const testCase of testCases) {
        const testServer = new ApolloServer({
          typeDefs: `
            type Query {
              testError: String
            }
          `,
          resolvers: {
            Query: {
              testError: testCase.resolver,
            },
          },
          formatError: createGraphQLErrorFormatter(),
        });

        const response = await testServer.executeOperation({
          query: 'query { testError }',
        }) as unknown as GraphQLResponse;

        expect(response.body.singleResult.errors).toBeDefined();
        expect(response.body.singleResult.errors?.length).toBe(1);

        const error = response.body.singleResult.errors?.[0] as ErrorResponse;
        expect(error.message).toBe(testCase.expectedMessage);
        expect(error.extensions?.code).toBe(testCase.expectedCode);
        expect(error.extensions?.category).toBe(testCase.expectedCategory);
      }
    });
  });
}); 