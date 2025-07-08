import { AppError, ErrorCode, ErrorCategory } from '../../../src/errors/app-error';

describe('AppError System', () => {
  describe('AppError Base Class', () => {
    it('should create validation error with proper structure', () => {
      // Given
      const message = 'Invalid input provided';
      const code = ErrorCode.VALIDATION_ERROR;
      const details = { field: 'email', value: 'invalid-email' };

      // When
      const error = new AppError(message, code, details);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(error.details).toEqual(details);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error.name).toBe('AppError');
    });

    it('should create server error with default details', () => {
      // Given
      const message = 'Database connection failed';
      const code = ErrorCode.INTERNAL_SERVER_ERROR;

      // When
      const error = new AppError(message, code);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(error.details).toEqual({});
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should format error for GraphQL response', () => {
      // Given
      const message = 'Resource not found';
      const code = ErrorCode.NOT_FOUND;
      const details = { resourceId: '123', resourceType: 'User' };
      const error = new AppError(message, code, details);

      // When
      const formatted = error.toGraphQLFormat();

      // Then
      expect(formatted).toEqual({
        message,
        extensions: {
          code,
          category: ErrorCategory.CLIENT_ERROR,
          details,
          timestamp: error.timestamp.toISOString(),
        },
      });
    });

    it('should format error for logging', () => {
      // Given
      const message = 'Authentication failed';
      const code = ErrorCode.UNAUTHORIZED;
      const details = { userId: '456', reason: 'Invalid token' };
      const error = new AppError(message, code, details);

      // When
      const logged = error.toLogFormat();

      // Then
      expect(logged).toEqual({
        name: 'AppError',
        message,
        code,
        category: ErrorCategory.CLIENT_ERROR,
        details,
        timestamp: error.timestamp.toISOString(),
        stack: error.stack,
      });
    });
  });

  describe('Error Code Mappings', () => {
    it('should map validation errors to client error category', () => {
      // Given / When
      const validationCodes = [
        ErrorCode.VALIDATION_ERROR,
        ErrorCode.INVALID_INPUT,
        ErrorCode.REQUIRED_FIELD_MISSING,
      ];

      // Then
      validationCodes.forEach(code => {
        const error = new AppError('Test message', code);
        expect(error.category).toBe(ErrorCategory.CLIENT_ERROR);
      });
    });

    it('should map authentication errors to client error category', () => {
      // Given / When
      const authCodes = [
        ErrorCode.UNAUTHORIZED,
        ErrorCode.FORBIDDEN,
        ErrorCode.AUTHENTICATION_REQUIRED,
      ];

      // Then
      authCodes.forEach(code => {
        const error = new AppError('Test message', code);
        expect(error.category).toBe(ErrorCategory.CLIENT_ERROR);
      });
    });

    it('should map server errors to server error category', () => {
      // Given / When
      const serverCodes = [
        ErrorCode.INTERNAL_SERVER_ERROR,
        ErrorCode.DATABASE_ERROR,
        ErrorCode.EXTERNAL_SERVICE_ERROR,
      ];

      // Then
      serverCodes.forEach(code => {
        const error = new AppError('Test message', code);
        expect(error.category).toBe(ErrorCategory.SERVER_ERROR);
      });
    });
  });

  describe('Error Details Validation', () => {
    it('should accept complex details object', () => {
      // Given
      const complexDetails = {
        validationErrors: [
          { field: 'email', message: 'Invalid format' },
          { field: 'password', message: 'Too weak' },
        ],
        requestId: 'req-123',
        userId: 'user-456',
      };

      // When
      const error = new AppError('Multiple validation errors', ErrorCode.VALIDATION_ERROR, complexDetails);

      // Then
      expect(error.details).toEqual(complexDetails);
    });

    it('should handle null or undefined details gracefully', () => {
      // Given / When
      const errorWithNull = new AppError('Test', ErrorCode.NOT_FOUND, null);
      const errorWithUndefined = new AppError('Test', ErrorCode.NOT_FOUND, undefined);

      // Then
      expect(errorWithNull.details).toEqual({});
      expect(errorWithUndefined.details).toEqual({});
    });
  });
}); 