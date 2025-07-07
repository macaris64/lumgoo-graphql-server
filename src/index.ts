import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import type { Context } from './types/context';

/**
 * Create Apollo Server instance
 */
const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  introspection: process.env.GRAPHQL_INTROSPECTION === 'true',
  includeStacktraceInErrorResponses: process.env.NODE_ENV === 'development',
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

    console.log(`🚀 Server ready at: ${url}`);
    console.log(`📊 GraphQL Playground: ${url}graphql`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer().catch(console.error);
} 