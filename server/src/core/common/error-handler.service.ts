import { FastifyRequest, FastifyReply } from 'fastify';

export class ErrorHandlerService {
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
