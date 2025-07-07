#!/usr/bin/env ts-node

import { MockGraphQLClient } from './mock-client';

/**
 * Demo script to test GraphQL server with mock client
 * Run this script to see example GraphQL operations
 */
async function runDemo(): Promise<void> {
  console.log('🚀 Starting GraphQL Server Demo...\n');
  
  const client = new MockGraphQLClient();
  
  try {
    await client.runAllTests();
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export default runDemo; 