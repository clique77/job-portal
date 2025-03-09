import { FastifyRequest } from "fastify";

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
    totalPages: number;
  };
}

export interface IPaginationService {
  getPaginationParams(request: FastifyRequest): PaginationParams;
  createPaginationResult<T>(data: T[], total: number, page: number, limit: number): PaginationResult<T>;
}
