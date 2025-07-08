import type { JsonObject } from '../types/json';

/**
 * Error categories for grouping related error types
 */
export enum ErrorCategory {
  CLIENT_ERROR = 'CLIENT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Comprehensive error codes for the application
 */
export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',

  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  AUTHENTICATION_REQUIRED = 'AUTHENTICATION_REQUIRED',

  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Network & Communication
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Error details type for providing additional context
 */
export interface ErrorDetails extends JsonObject {
  field?: string;
  value?: string | number | boolean;
  resourceId?: string;
  resourceType?: string;
  userId?: string;
  requestId?: string;
  reason?: string;
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * GraphQL formatted error structure
 */
export interface GraphQLFormattedError {
  message: string;
  extensions: {
    code: ErrorCode;
    category: ErrorCategory;
    details: ErrorDetails;
    timestamp: string;
  };
}

/**
 * Log formatted error structure
 */
export interface LogFormattedError {
  name: string;
  message: string;
  code: ErrorCode;
  category: ErrorCategory;
  details: ErrorDetails;
  timestamp: string;
  stack?: string;
}

/**
 * Maps error codes to their respective categories
 */
const ERROR_CODE_TO_CATEGORY_MAP: Record<ErrorCode, ErrorCategory> = {
  // Validation Errors
  [ErrorCode.VALIDATION_ERROR]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.INVALID_INPUT]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.REQUIRED_FIELD_MISSING]: ErrorCategory.CLIENT_ERROR,

  // Authentication & Authorization
  [ErrorCode.UNAUTHORIZED]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.FORBIDDEN]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.AUTHENTICATION_REQUIRED]: ErrorCategory.CLIENT_ERROR,

  // Resource Errors
  [ErrorCode.NOT_FOUND]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.ALREADY_EXISTS]: ErrorCategory.CLIENT_ERROR,
  [ErrorCode.CONFLICT]: ErrorCategory.CLIENT_ERROR,

  // Server Errors
  [ErrorCode.INTERNAL_SERVER_ERROR]: ErrorCategory.SERVER_ERROR,
  [ErrorCode.DATABASE_ERROR]: ErrorCategory.SERVER_ERROR,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: ErrorCategory.SERVER_ERROR,

  // Network & Communication
  [ErrorCode.NETWORK_ERROR]: ErrorCategory.SERVER_ERROR,
  [ErrorCode.TIMEOUT_ERROR]: ErrorCategory.SERVER_ERROR,
  [ErrorCode.RATE_LIMIT_EXCEEDED]: ErrorCategory.CLIENT_ERROR,
};

/**
 * Generic application error class with structured error handling
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly category: ErrorCategory;
  public readonly details: ErrorDetails;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    details: ErrorDetails | null | undefined = {}
  ) {
    super(message);

    this.name = 'AppError';
    this.code = code;
    this.category = ERROR_CODE_TO_CATEGORY_MAP[code];
    this.details = details || {};
    this.timestamp = new Date();

    // Ensure stack trace is captured
    Error.captureStackTrace(this, AppError);
  }

  /**
   * Format error for GraphQL response
   */
  public toGraphQLFormat(): GraphQLFormattedError {
    return {
      message: this.message,
      extensions: {
        code: this.code,
        category: this.category,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
      },
    };
  }

  /**
   * Format error for logging
   */
  public toLogFormat(): LogFormattedError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      ...(this.stack && { stack: this.stack }),
    };
  }

  /**
   * Check if error is a client error
   */
  public isClientError(): boolean {
    return this.category === ErrorCategory.CLIENT_ERROR;
  }

  /**
   * Check if error is a server error
   */
  public isServerError(): boolean {
    return this.category === ErrorCategory.SERVER_ERROR;
  }
}
