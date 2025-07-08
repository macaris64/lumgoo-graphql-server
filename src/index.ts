import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createGraphQLErrorFormatter } from './errors/error-handler';
import type { Context } from './types/context';

/**
 * Create Apollo Server instance
 */
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
  formatError: createGraphQLErrorFormatter(),
});

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: Number(process.env.PORT) || 4000 },
      context: async ({ req: _req }): Promise<Context> => {
        // Add context properties here as needed
        return {};
      },
    });

    // eslint-disable-next-line no-console
    console.log(`🚀 Server ready at: ${url}`);
    // eslint-disable-next-line no-console
    console.log(`📊 GraphQL Playground: ${url}graphql`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  // eslint-disable-next-line no-console
  startServer().catch(console.error);
}
