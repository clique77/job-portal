import { FastifyInstance } from "fastify";
import userCompanyController from "../../api/controllers/userCompany/UserCompanyController";
import { authenticate } from "../../api/middleware/AuthMiddleware";
import { UserCompanyCreateData } from "../../data/repositories/UserCompany/UserCompanyRepository";
import { CompanyRole } from "../../data/models/UserCompany";

export default function(fastify: FastifyInstance, _options: any, done: () => void) {
  // Add user to company
  fastify.post<{
    Body: UserCompanyCreateData
  }>('/api/user-companies', {
    preHandler: [authenticate]
  }, userCompanyController.addUserToCompany);

  // Get user-company relationship by ID
  fastify.get<{
    Params: { id: string }
  }>('/api/user-companies/:id', {
    preHandler: [authenticate]
  }, userCompanyController.getUserCompanyById);

  // Update user's role in a company
  fastify.patch<{
    Params: { id: string },
    Body: { role: CompanyRole }
  }>('/api/user-companies/:id/role', {
    preHandler: [authenticate]
  }, userCompanyController.updateUserCompanyRole);

  // Remove user from company
  fastify.delete<{
    Params: { userId: string, companyId: string }
  }>('/api/companies/:companyId/users/:userId', {
    preHandler: [authenticate]
  }, userCompanyController.removeUserFromCompany);

  // Get all companies for current user
  fastify.get('/api/me/companies', {
    preHandler: [authenticate]
  }, userCompanyController.getUserCompanies);

  // Get all members of a company
  fastify.get<{
    Params: { companyId: string }
  }>('/api/companies/:companyId/members', {
    preHandler: [authenticate]
  }, userCompanyController.getCompanyMembers);

  // Get relationship between a user and a company
  fastify.get<{
    Params: { userId: string, companyId: string }
  }>('/api/companies/:companyId/users/:userId/relation', {
    preHandler: [authenticate]
  }, userCompanyController.getUserCompanyRelation);

  done();
} 