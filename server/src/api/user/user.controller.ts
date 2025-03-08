import { FastifyRequest, FastifyReply } from 'fastify';
import { IUserService } from '../../core/user/user.service.interface';
import { IErrorHandlerService } from '../../core/common/error-handler/error-handler.interface';
import { IPaginationService } from '../../core/common/pagination/pagination.service.interface';

export class UserController {
  private userService: IUserService;
  private errorHandlerService: IErrorHandlerService;
  private paginationService: IPaginationService;

  constructor(userService: IUserService, errorHandlerService: IErrorHandlerService, paginationService: IPaginationService) {
    this.userService = userService;
    this.errorHandlerService = errorHandlerService;
    this.paginationService = paginationService;
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;

      const user = await this.userService.getUserById(userId);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return { user };
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit } = this.paginationService.getPaginationParams(request);
      const result = await this.userService.getAllUsers(page, limit);

      return this.paginationService.createPaginationResult(
        result.users,
        result.total,
        page,
        limit
      );
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 500);
    }
  }
}

import userService from '../../core/user/user.service';
import errorHandlerService from '../../core/common/error-handler/error-handler.service';
import paginationService from '../../core/common/pagination/pagination.service';

export const userController = new UserController(userService, errorHandlerService, paginationService);
export default userController;
