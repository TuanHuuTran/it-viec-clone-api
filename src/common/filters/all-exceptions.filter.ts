import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus, Logger, UnauthorizedException } from "@nestjs/common";
import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { ValidationError } from 'class-validator';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError } from 'jsonwebtoken';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const path = request.url;

    // Default error response
    let errorResponse: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: path
    };

    // Handle JWT specific errors
    if (this.isJwtError(exception)) {
      errorResponse = this.handleJwtError(exception, path);
    }
    // Handle UnauthorizedException (which often wraps JWT errors)
    else if (exception instanceof UnauthorizedException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Check if this is a JWT-related unauthorized error
      if (exception.cause && this.isJwtError(exception.cause)) {
        errorResponse = this.handleJwtError(exception.cause, path);
      } else {
        errorResponse = {
          statusCode: status,
          message: exceptionResponse.message || 'Authentication failed',
          error: 'Unauthorized',
          timestamp: new Date().toISOString(),
          path: path
        };
      }
    }
    // Handle HttpException
    else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Check if this is a validation error (BadRequestException with array of messages)
      if (status === HttpStatus.BAD_REQUEST &&
        exceptionResponse &&
        Array.isArray(exceptionResponse.message)) {

        errorResponse = {
          statusCode: status,
          message: exceptionResponse.message,
          error: 'Validation Error',
          timestamp: new Date().toISOString(),
          path: path
        };
      } else {
        // Regular HttpException handling
        errorResponse = {
          statusCode: status,
          message: exceptionResponse.message || exception.message,
          error: exceptionResponse.error || 'Http Exception',
          timestamp: new Date().toISOString(),
          path: path
        };
      }
    }
    // Handle raw Validation Errors
    else if (exception.message?.message instanceof Array &&
      exception.message.message[0] instanceof ValidationError) {

      const validationErrors = exception.message.message as ValidationError[];
      const messages = this.formatValidationErrors(validationErrors);

      errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        message: messages,
        error: 'Validation Error',
        timestamp: new Date().toISOString(),
        path: path
      };
    }
    // Handle Prisma Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorResponse = this.handlePrismaError(exception, path);
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      `Error: ${JSON.stringify(errorResponse)}`
    );

    // Send the error response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private isJwtError(error: any): boolean {
    return (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError ||
      (error && error.name &&
        ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name))
    );
  }

  private handleJwtError(exception: any, path: string): ErrorResponse {
    let message = 'Authentication failed';
    let error = 'JWT Authentication Error';

    // Provide more specific messages based on the JWT error type
    if (exception instanceof TokenExpiredError || exception.name === 'TokenExpiredError') {
      message = 'JWT token has expired';
      error = 'Token Expired';
    } else if (exception instanceof NotBeforeError || exception.name === 'NotBeforeError') {
      message = 'JWT token not active yet';
      error = 'Token Not Active';
    } else if (exception instanceof JsonWebTokenError || exception.name === 'JsonWebTokenError') {
      message = 'Invalid JWT token';
      error = 'Invalid Token';
    }

    return {
      statusCode: HttpStatus.UNAUTHORIZED,
      message,
      error,
      timestamp: new Date().toISOString(),
      path
    };
  }

  private formatValidationErrors(errors: ValidationError[]): string[] {
    const messages: string[] = [];

    for (const error of errors) {
      if (error.constraints) {
        for (const key in error.constraints) {
          messages.push(error.constraints[key]);
        }
      }

      if (error.children && error.children.length > 0) {
        messages.push(...this.formatValidationErrors(error.children));
      }
    }

    return messages;
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError, path: string): ErrorResponse {
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let error = 'Database Error';

    // Handle specific Prisma error codes
    switch (exception.code) {
      case 'P2002': // Unique constraint violation
        statusCode = HttpStatus.CONFLICT;
        message = `Duplicate entry for ${exception.meta?.target}`;
        error = 'Unique Constraint Violation';
        break;
      case 'P2025': // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        error = 'Not Found';
        break;
      case 'P2003': // Foreign key constraint failed
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Related record does not exist';
        error = 'Foreign Key Constraint Failed';
        break;
      case 'P2014': // The provided value violates a required relation
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Invalid relation';
        error = 'Invalid Relation';
        break;
      default:
        this.logger.error(`Unhandled Prisma error: ${exception.code}`);
    }

    return {
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path
    };
  }
}
