import { FastifyRequest } from 'fastify';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  }
}

export class PaginationService {
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
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export const paginationService = new PaginationService();
export default paginationService;
