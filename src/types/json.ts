/**
 * JSON value type that covers all possible JSON values
 * Used for GraphQL JSON scalar type
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

/**
 * JSON object type - an object with string keys and JsonValue values
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * JSON array type - an array of JsonValue items
 */
export type JsonArray = JsonValue[];

/**
 * Union type for all JSON types
 */
export type Json = JsonValue;
