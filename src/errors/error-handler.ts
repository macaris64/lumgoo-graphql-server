import { GraphQLError } from 'graphql';
import {
  AppError,
  ErrorCode,
  ErrorCategory,
  type ErrorDetails,
  type LogFormattedError,
} from './app-error';
import { GraphQLFormattedError } from 'graphql';

/**
 * Result of error handling containing formatted error and log data
 */
export interface ErrorHandlerResult {
  isAppError: boolean;
  graphqlError: GraphQLError;
  logData: LogFormattedError & {
    originalError?: string;
  };
}

/**
 * Error handler that processes various error types and formats them for GraphQL and logging
 */
export class ErrorHandler {
  /**
   * Handle any error type and return formatted result
   */
  public handleError(error: Error | AppError | string): ErrorHandlerResult {
    if (ErrorHandler.isAppError(error)) {
      return this.handleAppError(error);
    }

    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    return this.handleStringError(error);
  }

  /**
   * Handle AppError instances
   */
  private handleAppError(error: AppError): ErrorHandlerResult {
    // For server errors, mask the message and details for clients
    if (error.isServerError()) {
      const maskedError = new AppError(
        'Internal server error',
        ErrorCode.INTERNAL_SERVER_ERROR,
        {} // No details for clients
      );

      return {
        isAppError: true,
        graphqlError: new GraphQLError(maskedError.message, {
          extensions: maskedError.toGraphQLFormat().extensions,
        }),
        logData: {
          ...error.toLogFormat(),
          originalError: error.message,
        },
      };
    }

    // For client errors, preserve the original message and details
    return {
      isAppError: true,
      graphqlError: new GraphQLError(error.message, {
        extensions: error.toGraphQLFormat().extensions,
      }),
      logData: error.toLogFormat(),
    };
  }

  /**
   * Handle generic Error instances
   */
  private handleGenericError(error: Error): ErrorHandlerResult {
    const appError = new AppError(
      'Internal server error',
      ErrorCode.INTERNAL_SERVER_ERROR,
      {}
    );

    return {
      isAppError: false,
      graphqlError: new GraphQLError(appError.message, {
        extensions: appError.toGraphQLFormat().extensions,
      }),
      logData: {
        ...appError.toLogFormat(),
        originalError: error.message,
      },
    };
  }

  /**
   * Handle string errors
   */
  private handleStringError(error: string): ErrorHandlerResult {
    const appError = new AppError(
      'Internal server error',
      ErrorCode.INTERNAL_SERVER_ERROR,
      {}
    );

    return {
      isAppError: false,
      graphqlError: new GraphQLError(appError.message, {
        extensions: appError.toGraphQLFormat().extensions,
      }),
      logData: {
        ...appError.toLogFormat(),
        originalError: error,
      },
    };
  }

  /**
   * Check if error is an AppError instance
   */
  public static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Check if error is a generic Error instance
   */
  public static isError(error: unknown): error is Error {
    return error instanceof Error;
  }

  /**
   * Check if error is a string
   */
  public static isString(error: unknown): error is string {
    return typeof error === 'string';
  }

  /**
   * Extract original error from GraphQL error
   */
  public static extractOriginalError(
    graphqlError: GraphQLError
  ): Error | AppError {
    return graphqlError.originalError || graphqlError;
  }
}

/**
 * Create GraphQL error formatter function
 */
export function createGraphQLErrorFormatter(): (
  formattedError: GraphQLFormattedError,
  error: unknown
) => GraphQLFormattedError {
  const errorHandler = new ErrorHandler();

  return (
    formattedError: GraphQLFormattedError,
    error: unknown
  ): GraphQLFormattedError => {
    // Handle GraphQL validation errors first (they don't have originalError)
    if (
      formattedError.message.includes('Cannot query field') ||
      formattedError.message.includes('Syntax error') ||
      formattedError.message.includes(
        'Cannot return null for non-nullable field'
      ) ||
      formattedError.message.includes('Field') ||
      formattedError.message.includes('validation')
    ) {
      return {
        message: formattedError.message,
        extensions: {
          code: ErrorCode.VALIDATION_ERROR,
          category: ErrorCategory.CLIENT_ERROR,
          details: {} as ErrorDetails,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Then check if error is GraphQLError with originalError
    if (error instanceof GraphQLError && error.originalError) {
      const originalError = error.originalError;

      // Handle AppError instances wrapped in GraphQLError
      if (ErrorHandler.isAppError(originalError)) {
        const result = errorHandler.handleError(originalError);
        return {
          message: result.graphqlError.message,
          ...(result.graphqlError.extensions && {
            extensions: result.graphqlError.extensions,
          }),
        };
      }

      // Handle generic errors wrapped in GraphQLError
      if (ErrorHandler.isError(originalError)) {
        const result = errorHandler.handleError(originalError);
        return {
          message: result.graphqlError.message,
          ...(result.graphqlError.extensions && {
            extensions: result.graphqlError.extensions,
          }),
        };
      }

      // Handle string errors wrapped in GraphQLError
      if (ErrorHandler.isString(originalError)) {
        const result = errorHandler.handleError(originalError);
        return {
          message: result.graphqlError.message,
          ...(result.graphqlError.extensions && {
            extensions: result.graphqlError.extensions,
          }),
        };
      }
    }

    // Handle direct AppError instances (fallback)
    if (ErrorHandler.isAppError(error)) {
      const result = errorHandler.handleError(error);
      return {
        message: result.graphqlError.message,
        ...(result.graphqlError.extensions && {
          extensions: result.graphqlError.extensions,
        }),
      };
    }

    // Handle direct generic errors (fallback)
    if (ErrorHandler.isError(error)) {
      const result = errorHandler.handleError(error);
      return {
        message: result.graphqlError.message,
        ...(result.graphqlError.extensions && {
          extensions: result.graphqlError.extensions,
        }),
      };
    }

    // Handle direct string errors (fallback)
    if (ErrorHandler.isString(error)) {
      const result = errorHandler.handleError(error);
      return {
        message: result.graphqlError.message,
        ...(result.graphqlError.extensions && {
          extensions: result.graphqlError.extensions,
        }),
      };
    }

    // Default handling for other errors
    return {
      message: formattedError.message,
      extensions: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        category: ErrorCategory.SERVER_ERROR,
        details: {} as ErrorDetails,
        timestamp: new Date().toISOString(),
      },
    };
  };
}

/**
 * Utility function to create common validation errors
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: string
): AppError {
  const details: ErrorDetails = {};
  if (field) details.field = field;
  if (value) details.value = value;

  return new AppError(message, ErrorCode.VALIDATION_ERROR, details);
}

/**
 * Utility function to create not found errors
 */
export function createNotFoundError(
  resourceType: string,
  resourceId: string
): AppError {
  return new AppError(`${resourceType} not found`, ErrorCode.NOT_FOUND, {
    resourceType,
    resourceId,
  });
}

/**
 * Utility function to create unauthorized errors
 */
export function createUnauthorizedError(reason?: string): AppError {
  const details: ErrorDetails = {};
  if (reason) details.reason = reason;

  return new AppError('Unauthorized access', ErrorCode.UNAUTHORIZED, details);
}

/**
 * Utility function to create server errors
 */
export function createServerError(
  message: string,
  details?: ErrorDetails
): AppError {
  return new AppError(message, ErrorCode.INTERNAL_SERVER_ERROR, details || {});
}
