import { healthResolver } from '../../../src/resolvers/health/health.resolver';
import type { Context } from '../../../src/types/context';
import type { GraphQLResolveInfo } from 'graphql';

describe('Health Resolver', () => {
  describe('health query', () => {
    it('should return correct health status', async () => {
      // Given
      const mockParent = {};
      const mockArgs = {};
      const mockContext: Context = {};
      const mockInfo: Partial<GraphQLResolveInfo> = { fieldName: 'health' };
      
      // When
      const result = await healthResolver(mockParent, mockArgs, mockContext, mockInfo as GraphQLResolveInfo);
      
      // Then
      expect(result.status).toBe('UP');
      expect(result.uptime).toBeGreaterThan(0);
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return uptime as a number', async () => {
      // Given
      const mockParent = {};
      const mockArgs = {};
      const mockContext: Context = {};
      const mockInfo: Partial<GraphQLResolveInfo> = { fieldName: 'health' };
      
      // When
      const result = await healthResolver(mockParent, mockArgs, mockContext, mockInfo as GraphQLResolveInfo);
      
      // Then
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return current timestamp in ISO format', async () => {
      // Given
      const mockParent = {};
      const mockArgs = {};
      const mockContext: Context = {};
      const mockInfo: Partial<GraphQLResolveInfo> = { fieldName: 'health' };
      const beforeTime = new Date();
      
      // When
      const result = await healthResolver(mockParent, mockArgs, mockContext, mockInfo as GraphQLResolveInfo);
      const afterTime = new Date();
      
      // Then
      const resultTime = new Date(result.timestamp);
      expect(resultTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(resultTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
}); 