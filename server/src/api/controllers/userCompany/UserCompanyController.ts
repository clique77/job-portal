import { FastifyRequest, FastifyReply } from "fastify";
import { IErrorHandlerService } from "../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces";
import { IUserCompanyService } from "../../../core/services/UserCompany/interfaces/IUserCompanyService";
import { UserCompanyCreateData } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import { CompanyRole } from "../../../data/models/UserCompany";

type UserCompanyIdParams ={
  companyId: string;
  userId: string;
}

class UserCompanyController {
  private userCompanyService: IUserCompanyService;
  private errorHandlerService: IErrorHandlerService;

  constructor(
    userCompanyService: IUserCompanyService,
    errorHandlerService: IErrorHandlerService
  ) {
    this.userCompanyService = userCompanyService;
    this.errorHandlerService = errorHandlerService;

    this.addUserToCompany = this.addUserToCompany.bind(this);
    this.getUserCompanyById = this.getUserCompanyById.bind(this);
    this.updateUserCompanyRole = this.updateUserCompanyRole.bind(this);
    this.removeUserFromCompany = this.removeUserFromCompany.bind(this);
    this.getUserCompanies = this.getUserCompanies.bind(this);
    this.getCompanyMembers = this.getCompanyMembers.bind(this);
    this.getUserCompanyRelation = this.getUserCompanyRelation.bind(this);
  }

  async addUserToCompany(request: FastifyRequest<{ Body: UserCompanyCreateData }>, reply: FastifyReply) {
    try {
      const userCompanyData = request.body;
      const userCompany = await this.userCompanyService.addUserToCompany(userCompanyData);

      return reply.status(201).send({
        success: true,
        message: "User added to company successfully",
        userCompany
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getUserCompanyById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const userCompanyId = request.params.id;
      const userCompany = await this.userCompanyService.getUserCompanyById(userCompanyId);

      if (!userCompany) {
        return reply.status(404).send({
          success: false,
          message: "User-company relationship not found"
        });
      }

      return reply.status(200).send({
        success: true,
        message: "User-company relationship fetched successfully",
        userCompany
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async updateUserCompanyRole(
    request: FastifyRequest<{ Params: { id: string }; Body: { role: CompanyRole } }>,
    reply: FastifyReply
  ) {
    try {
      const userCompanyId = request.params.id;
      const { role } = request.body;
      //@ts-ignore
      const requesterId = request.user.id;

      const userCompany = await this.userCompanyService.updateUserCompanyRole(
        userCompanyId,
        role,
        requesterId
      );

      if (!userCompany) {
        return reply.status(404).send({
          success: false,
          message: "User-company relationship not found or you don't have permission to update it"
        });
      }

      return reply.status(200).send({
        success: true,
        message: "User role updated successfully",
        userCompany
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async removeUserFromCompany(request: FastifyRequest<{ Params: UserCompanyIdParams }>, reply: FastifyReply) {
    try {
      const { userId, companyId } = request.params;
      //@ts-ignore
      const requesterId = request.user.id;

      const result = await this.userCompanyService.removeUserFromCompany(
        userId,
        companyId,
        requesterId
      );

      if (!result) {
        return reply.status(404).send({
          success: false,
          message: "User-company relationship not found or you don't have permission to remove it"
        });
      }

      return reply.status(200).send({
        success: true,
        message: "User removed from company successfully"
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getUserCompanies(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;
      const userCompanies = await this.userCompanyService.getUserCompanies(userId);

      return reply.status(200).send({
        success: true,
        message: "User companies fetched successfully",
        data: userCompanies
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async getCompanyMembers(request: FastifyRequest<{ Params: { companyId: string } }>, reply: FastifyReply) {
    try {
      const { companyId } = request.params;
      const members = await this.userCompanyService.getCompanyMembers(companyId);

      return reply.status(200).send({
        success: true,
        message: "Company members fetched successfully",
        data: members
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async getUserCompanyRelation(
    request: FastifyRequest<{ Params: UserCompanyIdParams }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, companyId } = request.params;
      const relation = await this.userCompanyService.getUserCompanyRelation(userId, companyId);

      if (!relation) {
        return reply.status(404).send({
          success: false,
          message: "User-company relationship not found"
        });
      }

      return reply.status(200).send({
        success: true,
        message: "User-company relationship fetched successfully",
        data: relation
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }
}

import userCompanyService from '../../../core/services/UserCompany/UserCompanyService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';

export const userCompanyController = new UserCompanyController(
  userCompanyService,
  errorHandlerService
);

export default userCompanyController; 