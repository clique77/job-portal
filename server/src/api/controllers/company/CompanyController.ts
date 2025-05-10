import { FastifyRequest, FastifyReply } from "fastify";
import { IErrorHandlerService } from "../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces";
import { IPaginationService } from "../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces";
import { ICompanyService } from "../../../core/services/company/interfaces/ICompanyService";
import { CompanyCreateData, CompanyUpdateData } from "../../../data/repositories/Company/CompanyRepository";

class CompanyController {
  private companyService: ICompanyService;
  private errorHandlerService: IErrorHandlerService;
  private paginationService: IPaginationService;

  constructor(
    companyService: ICompanyService,
    errorHandlerService: IErrorHandlerService,
    paginationService: IPaginationService
  ) {
    this.companyService = companyService;
    this.errorHandlerService = errorHandlerService;
    this.paginationService = paginationService;

    this.createCompany = this.createCompany.bind(this);
    this.getCompanyById = this.getCompanyById.bind(this);
    this.updateCompany = this.updateCompany.bind(this);
    this.deleteCompany = this.deleteCompany.bind(this);
    this.getAllCompanies = this.getAllCompanies.bind(this);
    this.getCompaniesByCreator = this.getCompaniesByCreator.bind(this);
    this.searchCompanies = this.searchCompanies.bind(this);
  }

  async createCompany(request: FastifyRequest<{ Body: CompanyCreateData }>, reply: FastifyReply) {
    try {
      const companyData = request.body;
      //@ts-ignore
      const creatorId = request.user.id;

      const company = await this.companyService.createCompany(companyData, creatorId);

      return reply.status(201).send({ 
        success: true,
        message: "Company created successfully", 
        company 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getCompanyById(request: FastifyRequest<{ Params: { id: string} }>, reply: FastifyReply) {
    try {
      const companyId = request.params.id;
      const company = await this.companyService.getCompanyById(companyId);

      if (!company) {
        return reply.status(404).send({ 
          success: false,
          message: "Company not found" 
        });
      }

      return reply.status(200).send({ 
        success: true,
        message: "Company fetched successfully", 
        company 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async updateCompany(
    request: FastifyRequest<{ Params: { id: string }; Body: CompanyUpdateData }>,
    reply: FastifyReply
  ) {
    try {
      const companyId = request.params.id;
      const companyData = request.body;
      //@ts-ignore
      const userId = request.user.id;

      const updatedCompany = await this.companyService.updateCompany(
        companyId,
        companyData,
        userId
      );

      if (!updatedCompany) {
        return reply.status(404).send({ 
          success: false,
          message: "Company not found or you don't have permission to update it" 
        });
      }

      return reply.status(200).send({ 
        success: true,
        message: "Company updated successfully", 
        company: updatedCompany 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async deleteCompany(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const companyId = request.params.id;
      //@ts-ignore
      const userId = request.user.id;

      const result = await this.companyService.deleteCompany(companyId, userId);

      if (!result) {
        return reply.status(404).send({ 
          success: false,
          message: "Company not found or you don't have permission to delete it" 
        });
      }

      return reply.status(200).send({ 
        success: true,
        message: "Company deleted successfully" 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getAllCompanies(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit } = this.paginationService.getPaginationParams(request);
      const filter = request.query as any;

      const result = await this.companyService.getAllCompanies(page, limit, filter);

      return this.paginationService.createPaginationResult(
        result.companies,
        result.total,
        page,
        limit
      );
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async getCompaniesByCreator(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const userId = request.params.userId;
      const { page, limit } = this.paginationService.getPaginationParams(request);

      const result = await this.companyService.getCompaniesByCreator(userId, page, limit);

      return this.paginationService.createPaginationResult(
        result.companies,
        result.total,
        page,
        limit
      );
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async searchCompanies(request: FastifyRequest<{ Querystring: { query: string } }>, reply: FastifyReply) {
    try {
      const { query } = request.query;
      const { page, limit } = this.paginationService.getPaginationParams(request);

      if (!query || typeof query !== 'string') {
        return reply.status(400).send({ 
          success: false,
          message: "Search query is required" 
        });
      }

      const companies = await this.companyService.searchCompanies(query, page, limit);

      return reply.status(200).send({ 
        success: true,
        message: "Search results", 
        data: companies 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }
}

import companyService from '../../../core/services/company/CompanyService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import paginationService from '../../../core/services/common/pagination/PaginationService';

export const companyController = new CompanyController(
  companyService,
  errorHandlerService,
  paginationService
);

export default companyController; 