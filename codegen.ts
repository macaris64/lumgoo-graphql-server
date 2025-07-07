import type { CodegenConfig } from '@graphql-codegen/cli';

// JSON value type that covers all possible JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const config: CodegenConfig = {
  schema: './src/schema/**/*.graphql',
  generates: {
    './src/generated/graphql.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          DateTime: 'string',
          JSON: '../types/json#JsonObject'
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
          JSON: '../types/json#JsonObject'
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