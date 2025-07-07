import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>'
        },
        enumsAsTypes: true,
        constEnums: true,
        maybeValue: 'T | null | undefined'
      }
    },
    './src/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        scalars: {
          DateTime: 'string',
          JSON: 'Record<string, any>'
        },
        enumsAsTypes: true,
        constEnums: true,
        maybeValue: 'T | null | undefined',
        useIndexSignature: true,
        contextType: '../types/context#Context',
        mappers: {
          // Add custom mappers here when needed
        }
      }
    }
  },
  hooks: {
    afterOneFileWrite: ['prettier --write']
  }
};

export default config; 