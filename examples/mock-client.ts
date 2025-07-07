import { GraphQLClient } from 'graphql-request';
import { gql } from 'graphql-tag';

/**
 * Mock GraphQL Client for testing and demonstration
 * This client connects to the GraphQL server and provides example queries
 */
export class MockGraphQLClient {
  private client: GraphQLClient;

  constructor(endpoint: string = 'http://localhost:4000/graphql') {
    this.client = new GraphQLClient(endpoint);
  }

  /**
   * Test health check query
   */
  async testHealth() {
    const query = gql`
      query Health {
        health {
          status
          uptime
          timestamp
        }
      }
    `;

    try {
      const result = await this.client.request(query);
      console.log('Health Check Result:', result);
      return result;
    } catch (error) {
      console.error('Health Check Error:', error);
      throw error;
    }
  }

  /**
   * Test health query with specific fields
   */
  async testHealthPartial() {
    const query = gql`
      query HealthPartial {
        health {
          status
        }
      }
    `;

    try {
      const result = await this.client.request(query);
      console.log('Partial Health Check Result:', result);
      return result;
    } catch (error) {
      console.error('Partial Health Check Error:', error);
      throw error;
    }
  }

  /**
   * Test introspection query
   */
  async testIntrospection() {
    const query = gql`
      query Introspection {
        __schema {
          types {
            name
            kind
            description
          }
        }
      }
    `;

    try {
      const result = await this.client.request(query);
      console.log('Introspection Result:', result);
      return result;
    } catch (error) {
      console.error('Introspection Error:', error);
      throw error;
    }
  }

  /**
   * Mock user queries (for future implementation)
   */
  async mockUserQueries() {
    console.log('🔮 Mock User Queries - To be implemented');
    
    // Example queries for future user schema
    const mockQueries = [
      {
        name: 'Get User',
        query: `
          query GetUser($id: ID!) {
            user(id: $id) {
              id
              name
              email
              createdAt
            }
          }
        `,
        variables: { id: '1' }
      },
      {
        name: 'List Users',
        query: `
          query ListUsers($limit: Int, $offset: Int) {
            users(limit: $limit, offset: $offset) {
              id
              name
              email
              createdAt
            }
          }
        `,
        variables: { limit: 10, offset: 0 }
      }
    ];

    mockQueries.forEach(mock => {
      console.log(`📝 ${mock.name}:`, mock.query);
      console.log(`📊 Variables:`, mock.variables);
      console.log('---');
    });
  }

  /**
   * Mock product queries (for future implementation)
   */
  async mockProductQueries() {
    console.log('🔮 Mock Product Queries - To be implemented');
    
    // Example queries for future product schema
    const mockQueries = [
      {
        name: 'Get Product',
        query: `
          query GetProduct($id: ID!) {
            product(id: $id) {
              id
              name
              description
              price
              category
              createdAt
            }
          }
        `,
        variables: { id: '1' }
      },
      {
        name: 'Search Products',
        query: `
          query SearchProducts($search: String!, $category: String) {
            products(search: $search, category: $category) {
              id
              name
              description
              price
              category
            }
          }
        `,
        variables: { search: 'laptop', category: 'electronics' }
      }
    ];

    mockQueries.forEach(mock => {
      console.log(`📝 ${mock.name}:`, mock.query);
      console.log(`📊 Variables:`, mock.variables);
      console.log('---');
    });
  }

  /**
   * Mock mutation examples (for future implementation)
   */
  async mockMutations() {
    console.log('🔮 Mock Mutations - To be implemented');
    
    // Example mutations for future implementation
    const mockMutations = [
      {
        name: 'Create User',
        mutation: `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
              id
              name
              email
              createdAt
            }
          }
        `,
        variables: {
          input: {
            name: 'John Doe',
            email: 'john@example.com'
          }
        }
      },
      {
        name: 'Update Product',
        mutation: `
          mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
            updateProduct(id: $id, input: $input) {
              id
              name
              description
              price
              updatedAt
            }
          }
        `,
        variables: {
          id: '1',
          input: {
            name: 'Updated Product Name',
            price: 99.99
          }
        }
      }
    ];

    mockMutations.forEach(mock => {
      console.log(`📝 ${mock.name}:`, mock.mutation);
      console.log(`📊 Variables:`, mock.variables);
      console.log('---');
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Running Mock GraphQL Client Tests...\n');
    
    try {
      await this.testHealth();
      console.log('✅ Health check passed\n');
    } catch (error) {
      console.error('❌ Health check failed\n');
    }

    try {
      await this.testHealthPartial();
      console.log('✅ Partial health check passed\n');
    } catch (error) {
      console.error('❌ Partial health check failed\n');
    }

    try {
      await this.testIntrospection();
      console.log('✅ Introspection query passed\n');
    } catch (error) {
      console.error('❌ Introspection query failed\n');
    }

    // Mock future implementations
    await this.mockUserQueries();
    await this.mockProductQueries();
    await this.mockMutations();

    console.log('🎉 Mock client tests completed!');
  }
}

export default MockGraphQLClient; 