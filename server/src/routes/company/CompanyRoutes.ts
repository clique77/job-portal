import { FastifyInstance } from "fastify";
import companyController from "../../api/controllers/company/CompanyController";
import { authenticate, checkRole } from "../../api/middleware/AuthMiddleware";
import { UserRole } from "../../data/models/User";
import { CompanyCreateData, CompanyUpdateData } from "../../data/repositories/Company/CompanyRepository";

export default function(fastify: FastifyInstance, _options: any, done: () => void) {
  // Get all companies (public endpoint)
  fastify.get('/api/companies', companyController.getAllCompanies);

  // Get company by ID (public endpoint)
  fastify.get<{
    Params: { id: string }
  }>('/api/companies/:id', companyController.getCompanyById);

  // Create company (authenticated endpoint, all registered users)
  fastify.post<{
    Body: CompanyCreateData
  }>('/api/companies', {
    preHandler: [authenticate]
  }, companyController.createCompany);

  // Update company (authenticated endpoint, company admins/owners only - checked in the service)
  fastify.put<{
    Params: { id: string },
    Body: CompanyUpdateData
  }>('/api/companies/:id', {
    preHandler: [authenticate]
  }, companyController.updateCompany);

  // Delete company (authenticated endpoint, company owners only - checked in the service)
  fastify.delete<{
    Params: { id: string }
  }>('/api/companies/:id', {
    preHandler: [authenticate]
  }, companyController.deleteCompany);

  // Get companies by creator
  fastify.get<{
    Params: { userId: string }
  }>('/api/users/:userId/companies', {
    preHandler: [authenticate]
  }, companyController.getCompaniesByCreator);

  // Search companies
  fastify.get<{
    Querystring: { query: string }
  }>('/api/companies/search', companyController.searchCompanies);

  done();
} 