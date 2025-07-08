import { GraphQLError } from 'graphql';
import { AppError, ErrorCode, ErrorCategory } from '../../../src/errors/app-error';
import { 
  ErrorHandler, 
  createGraphQLErrorFormatter, 
  createValidationError, 
  createNotFoundError, 
  createUnauthorizedError, 
  createServerError 
} from '../../../src/errors/error-handler';

describe('Error Handler System', () => {
  describe('ErrorHandler Class', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
      errorHandler = new ErrorHandler();
    });

    it('should handle AppError and format for GraphQL', () => {
      // Given
      const appError = new AppError('User not found', ErrorCode.NOT_FOUND, {
        userId: '123',
        resourceType: 'User',
      });

      // When
      const result = errorHandler.handleError(appError);

      // Then
      expect(result.isAppError).toBe(true);
      expect(result.graphqlError.message).toBe('User not found');
      expect(result.graphqlError.extensions?.code).toBe(ErrorCode.NOT_FOUND);
      expect(result.graphqlError.extensions?.category).toBe('CLIENT_ERROR');
      expect(result.logData.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should handle generic Error and convert to AppError', () => {
      // Given
      const genericError = new Error('Something went wrong');

      // When
      const result = errorHandler.handleError(genericError);

      // Then
      expect(result.isAppError).toBe(false);
      expect(result.graphqlError.message).toBe('Internal server error');
      expect(result.graphqlError.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.logData.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.logData.originalError).toBe('Something went wrong');
    });

    it('should handle string errors', () => {
      // Given
      const stringError = 'Database connection failed';

      // When
      const result = errorHandler.handleError(stringError);

      // Then
      expect(result.isAppError).toBe(false);
      expect(result.graphqlError.message).toBe('Internal server error');
      expect(result.logData.originalError).toBe(stringError);
    });

    it('should mask server errors for clients', () => {
      // Given
      const serverError = new AppError('Database query failed', ErrorCode.DATABASE_ERROR, {
        query: 'SELECT * FROM sensitive_table',
        connection: 'prod-db-01',
      });

      // When
      const result = errorHandler.handleError(serverError);

      // Then
      expect(result.graphqlError.message).toBe('Internal server error');
      expect(result.graphqlError.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.logData.message).toBe('Database query failed'); // Original message in logs
      expect(result.logData.details).toEqual({
        query: 'SELECT * FROM sensitive_table',
        connection: 'prod-db-01',
      });
    });

    it('should preserve client errors for clients', () => {
      // Given
      const clientError = new AppError('Invalid email format', ErrorCode.VALIDATION_ERROR, {
        field: 'email',
        value: 'invalid-email',
      });

      // When
      const result = errorHandler.handleError(clientError);

      // Then
      expect(result.graphqlError.message).toBe('Invalid email format');
      expect(result.graphqlError.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.graphqlError.extensions?.details).toEqual({
        field: 'email',
        value: 'invalid-email',
      });
    });

    it('should preserve NOT_FOUND error message for client', () => {
      // Given
      const appError = new AppError('User not found', ErrorCode.NOT_FOUND, {
        userId: '123',
        resourceType: 'User',
      });

      // When
      const result = errorHandler.handleError(appError);

      // Then
      expect(result.isAppError).toBe(true);
      expect(result.graphqlError.message).toBe('User not found'); // Should NOT be masked
      expect(result.graphqlError.extensions?.code).toBe('NOT_FOUND');
      expect(result.graphqlError.extensions?.category).toBe('CLIENT_ERROR');
      expect(result.graphqlError.extensions?.details).toEqual({
        userId: '123',
        resourceType: 'User',
      });
      expect(result.logData.originalError).toBeUndefined(); // No masking for client errors
    });
  });

  describe('Static Utility Methods', () => {
    it('should identify AppError instances correctly', () => {
      // Given
      const appError = new AppError('Test error', ErrorCode.NOT_FOUND);
      const genericError = new Error('Generic error');

      // When
      const isAppError1 = ErrorHandler.isAppError(appError);
      const isAppError2 = ErrorHandler.isAppError(genericError);

      // Then
      expect(isAppError1).toBe(true);
      expect(isAppError2).toBe(false);
    });

    it('should identify Error instances correctly', () => {
      // Given
      const error = new Error('Test error');
      const appError = new AppError('Test error', ErrorCode.NOT_FOUND);
      const stringError = 'string error';

      // When
      const isError1 = ErrorHandler.isError(error);
      const isError2 = ErrorHandler.isError(appError);
      const isError3 = ErrorHandler.isError(stringError);

      // Then
      expect(isError1).toBe(true);
      expect(isError2).toBe(true); // AppError extends Error
      expect(isError3).toBe(false);
    });

    it('should identify string errors correctly', () => {
      // Given
      const stringError = 'string error';
      const error = new Error('Test error');

      // When
      const isString1 = ErrorHandler.isString(stringError);
      const isString2 = ErrorHandler.isString(error);

      // Then
      expect(isString1).toBe(true);
      expect(isString2).toBe(false);
    });

    it('should extract error from GraphQL error', () => {
      // Given
      const originalError = new AppError('Original error', ErrorCode.NOT_FOUND);
      const graphqlError = new GraphQLError('GraphQL Error', {
        originalError,
      });

      // When
      const extractedError = ErrorHandler.extractOriginalError(graphqlError);

      // Then
      expect(extractedError).toBe(originalError);
    });

    it('should handle GraphQL error without original error', () => {
      // Given
      const graphqlError = new GraphQLError('GraphQL Error');

      // When
      const extractedError = ErrorHandler.extractOriginalError(graphqlError);

      // Then
      expect(extractedError).toBe(graphqlError);
    });
  });

  describe('GraphQL Error Formatter', () => {
    let errorFormatter: ReturnType<typeof createGraphQLErrorFormatter>;

    beforeEach(() => {
      errorFormatter = createGraphQLErrorFormatter();
    });

    it('should format validation errors by message pattern', () => {
      // Given
      const formattedError = {
        message: 'Cannot query field "invalidField" on type "Query"',
        locations: [{ line: 2, column: 3 }],
        path: ['invalidField'],
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, new GraphQLError('validation error'));

      // Then
      expect(result.message).toBe('Cannot query field "invalidField" on type "Query"');
      expect(result.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.CLIENT_ERROR);
    });

    it('should format syntax errors by message pattern', () => {
      // Given
      const formattedError = {
        message: 'Syntax error in query',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, new GraphQLError('syntax error'));

      // Then
      expect(result.message).toBe('Syntax error in query');
      expect(result.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.CLIENT_ERROR);
    });

    it('should handle GraphQLError with AppError as originalError', () => {
      // Given
      const appError = new AppError('User not found', ErrorCode.NOT_FOUND);
      const graphqlError = new GraphQLError('GraphQL wrapper', {
        originalError: appError,
      });
      const formattedError = {
        message: 'User not found',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, graphqlError);

      // Then
      expect(result.message).toBe('User not found');
      expect(result.extensions?.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should handle unknown error types with default handling', () => {
      // Given
      const unknownError = { type: 'unknown', message: 'Unknown error' };
      const formattedError = {
        message: 'Unknown error occurred',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, unknownError);

      // Then
      expect(result.message).toBe('Unknown error occurred');
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.SERVER_ERROR);
    });

    it('should handle GraphQLError with generic Error as originalError', () => {
      // Given
      const genericError = new Error('Something went wrong');
      const graphqlError = new GraphQLError('GraphQL wrapper', {
        originalError: genericError,
      });
      const formattedError = {
        message: 'Something went wrong',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, graphqlError);

      // Then
      expect(result.message).toBe('Internal server error');
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should handle GraphQLError with string as originalError', () => {
      // Given
      const stringError = 'Database connection failed';
      const graphqlError = new GraphQLError('GraphQL wrapper', {
        originalError: stringError as any,
      });
      const formattedError = {
        message: 'Database connection failed',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, graphqlError);

      // Then
      expect(result.message).toBe('Internal server error');
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should handle direct generic Error (fallback)', () => {
      // Given
      const genericError = new Error('Unexpected error');
      const formattedError = {
        message: 'Unexpected error',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, genericError);

      // Then
      expect(result.message).toBe('Internal server error');
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should handle direct string error (fallback)', () => {
      // Given
      const stringError = 'Network timeout';
      const formattedError = {
        message: 'Network timeout',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, stringError);

      // Then
      expect(result.message).toBe('Internal server error');
      expect(result.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });

    it('should handle validation messages with Field pattern', () => {
      // Given
      const formattedError = {
        message: 'Field "test" is required',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, new GraphQLError('field error'));

      // Then
      expect(result.message).toBe('Field "test" is required');
      expect(result.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.CLIENT_ERROR);
    });

    it('should handle validation messages with null field pattern', () => {
      // Given
      const formattedError = {
        message: 'Cannot return null for non-nullable field Query.test',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, new GraphQLError('null field error'));

      // Then
      expect(result.message).toBe('Cannot return null for non-nullable field Query.test');
      expect(result.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.CLIENT_ERROR);
    });

    it('should handle validation messages with generic validation pattern', () => {
      // Given
      const formattedError = {
        message: 'Input validation failed',
        extensions: {},
      };

      // When
      const result = errorFormatter(formattedError as any, new GraphQLError('validation failed'));

      // Then
      expect(result.message).toBe('Input validation failed');
      expect(result.extensions?.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.extensions?.category).toBe(ErrorCategory.CLIENT_ERROR);
    });
  });

  describe('Utility Functions', () => {
    it('should create validation error with field and value', () => {
      // Given
      const message = 'Invalid email format';
      const field = 'email';
      const value = 'invalid-email';

      // When
      const error = createValidationError(message, field, value);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details.field).toBe(field);
      expect(error.details.value).toBe(value);
    });

    it('should create validation error without field and value', () => {
      // Given
      const message = 'Validation failed';

      // When
      const error = createValidationError(message);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details.field).toBeUndefined();
      expect(error.details.value).toBeUndefined();
    });

    it('should create not found error', () => {
      // Given
      const resourceType = 'User';
      const resourceId = '123';

      // When
      const error = createNotFoundError(resourceType, resourceId);

      // Then
      expect(error.message).toBe('User not found');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.details.resourceType).toBe(resourceType);
      expect(error.details.resourceId).toBe(resourceId);
    });

    it('should create unauthorized error with reason', () => {
      // Given
      const reason = 'Invalid token';

      // When
      const error = createUnauthorizedError(reason);

      // Then
      expect(error.message).toBe('Unauthorized access');
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.details.reason).toBe(reason);
    });

    it('should create unauthorized error without reason', () => {
      // When
      const error = createUnauthorizedError();

      // Then
      expect(error.message).toBe('Unauthorized access');
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.details.reason).toBeUndefined();
    });

    it('should create server error with details', () => {
      // Given
      const message = 'Database connection failed';
      const details = { connection: 'primary', database: 'main' };

      // When
      const error = createServerError(message, details);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(error.details).toEqual(details);
    });

    it('should create server error without details', () => {
      // Given
      const message = 'Server error occurred';

      // When
      const error = createServerError(message);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(error.details).toEqual({});
    });
  });
}); 