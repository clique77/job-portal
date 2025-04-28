import { FastifyRequest, FastifyReply } from 'fastify';
import { IUserService } from '../../../core/services/users/interfaces/IUserService';
import { IErrorHandlerService } from '../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces';
import { IPaginationService } from '../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces';
import { UserData } from '../../../core/useCases/user/UpdateUserProfile';
import path from 'path';
import config from '../../../config';
import { mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises'; 

export class UserController {
  private userService: IUserService;
  private errorHandlerService: IErrorHandlerService;
  private paginationService: IPaginationService;

  constructor(
    userService: IUserService,
    errorHandlerService: IErrorHandlerService, 
    paginationService: IPaginationService, 
  ) {
    this.userService = userService;
    this.errorHandlerService = errorHandlerService;
    this.paginationService = paginationService;
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateProfilePicture = this.updateProfilePicture.bind(this);
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

  async updateUserProfile(request: FastifyRequest<{ Body: UserData }>, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;
      const userData = request.body as UserData;

      const updatedUser = await this.userService.updateUserProfile(userId, userData);
      if (!updatedUser) {
        return reply.status(404).send({ message: 'Failed to update user profile '});
      }

      return {
        message: 'User profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async updatePassword(request: FastifyRequest<{ Body: { currentPassword: string, newPassword: string }}>, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;
      const { currentPassword, newPassword } = request.body;

      const updatedUser = await this.userService.updatePassword(userId, currentPassword, newPassword);
      if (!updatedUser) {
        return reply.status(404).send({ message: 'User not found'});
      }

      return {
        message: 'Password updated successfully',
        user: updatedUser
      };
    } catch (error) {
      return this.errorHandlerService.handleError(request,reply, error as Error, 400);
    }
  }

  async updateProfilePicture(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;
      const data = await request.file();
  
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' });
      }
  
      if (!data.mimetype.startsWith('image/')) {
        return reply.status(400).send({ message: 'Invalid file type. Please upload an image file.' });
      }
  
      if (data.file.bytesRead > config.uploads.maxSize) {
        return reply.status(400).send({ 
          message: `File size exceeds maximum limit of ${config.uploads.maxSize / 1024 / 1024}MB` 
        });
      }
  
      const uploadDir = path.join(config.uploads.directory, 'profile-pictures');
      await mkdir(uploadDir, { recursive: true });
  
      const fileName = `${Date.now()}-${data.filename}`;
      const filePath = path.join(uploadDir, fileName);
  
      await pipeline(data.file, createWriteStream(filePath));
  
      const profilePictureUrl = `/uploads/profile-pictures/${fileName}`;
      const updatedUser = await this.userService.updateProfilePicture(userId, profilePictureUrl);
  
      if (!updatedUser) {
        return reply.status(404).send({ message: 'Failed to update profile picture' });
      }
  
      return {
        message: 'Profile picture updated successfully',
        user: updatedUser
      };
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }
}

import userService from '../../../core/services/users/UserService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import paginationService from '../../../core/services/common/pagination/PaginationService';

export const userController = new UserController(userService, errorHandlerService, paginationService)
export default userController;
