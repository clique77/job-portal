import { FastifyRequest, FastifyReply } from 'fastify';
import { IErrorHandlerService } from './interfaces/ErrorHandlerInterfaces';

export class ErrorHandlerService implements IErrorHandlerService {
  handleError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: Error,
    statusCode: number = 500
  ): FastifyReply {
    console.error(`[ERROR] ${request.method} ${request.url}:`, error);

    // More specific error message based on the error type
    const errorMessage = error.message;
    const detailedMessage = process.env.NODE_ENV !== 'production'
      ? `Details: ${errorMessage}`
      : 'Check server logs for details.';

    return reply.status(statusCode).send({
      message: errorMessage,
      path: request.url,
      method: request.method,
      details: detailedMessage
    });
  }
}

export const errorHandlerService = new ErrorHandlerService();
export default errorHandlerService;
