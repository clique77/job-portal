import { FastifyRequest, FastifyReply } from "fastify";

export interface IErrorHandlerService {
  handleError(request: FastifyRequest, reply: FastifyReply, error: Error, statusCode: number): FastifyReply;
}
