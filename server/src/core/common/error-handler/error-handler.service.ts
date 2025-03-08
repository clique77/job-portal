import { FastifyRequest, FastifyReply } from 'fastify';
import { IErrorHandlerService } from './error-handler.interface';

export class ErrorHandlerService implements IErrorHandlerService {
  handleError(
    request: FastifyRequest,
    reply: FastifyReply,
    error: unknown,
    statusCode: number = 500
  ): FastifyReply {
    request.log.error(error);
    return reply.status(statusCode).send({
      message: (error as Error).message || 'Internal Server Error'
    });
  }
}

export const errorHandlerService = new ErrorHandlerService();
export default errorHandlerService;
