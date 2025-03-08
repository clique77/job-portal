import { FastifyRequest, FastifyReply } from 'fastify';
import userService from '../../core/user/user.service';
import errorHandlerService from '../../core/common/error-handler.service';
import paginationService from '../../core/common/pagination.service';

export class UserController {
  constructor() {
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;

      const user = await userService.getUserById(userId);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return { user };
    } catch (error) {
      return errorHandlerService.handleError(request, reply, error, 500);
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit } = paginationService.getPaginationParams(request);
      const result = await userService.getAllUsers(page, limit);

      return paginationService.createPaginationResult(
        result.users,
        result.total,
        page,
        limit
      );
    } catch (error) {
      return errorHandlerService.handleError(request, reply, error, 500);
    }
  }
}

export const userController = new UserController();
export default userController;
