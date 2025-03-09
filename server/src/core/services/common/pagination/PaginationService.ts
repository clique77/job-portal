import { FastifyRequest } from 'fastify';
import { IPaginationService, PaginationParams, PaginationResult } from './interfaces/PaginationServiceInterfaces';

export class PaginationService implements IPaginationService {
  getPaginationParams(request: FastifyRequest): PaginationParams {
    const query = request.query as { page?: string, limit?: string };
    const page = query.page ? parseInt(query.page) : 1;
    const limit = query.limit ? parseInt(query.limit) : 10;

    return { page, limit };
  }

  createPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
  ): PaginationResult<T> {
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export const paginationService = new PaginationService();
export default paginationService;
