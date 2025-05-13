import { FastifyInstance } from 'fastify';
import userController from '../../api/controllers/user/UserController';
import { authenticate } from '../../api/middleware/AuthMiddleware';
import { UserData } from '../../core/useCases/user/UpdateUserProfile';

interface UpdatePasswordBody {
  Body: {
    currentPassword: string;
    newPassword: string;
  }
}

interface UpdateProfileBody {
  Body: UserData;
}

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  fastify.get('/api/auth/me', {
    preValidation: [authenticate]
  }, userController.getCurrentUser);

  fastify.get('/api/users/:id', {
    preValidation: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, userController.getUserById);

  fastify.get('/api/users', {
    preValidation: [authenticate]
  }, userController.getAllUsers);

  fastify.put<UpdateProfileBody>('/api/users/profile', {
    preValidation: [authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          title: { type: 'string' },
          bio: { type: 'string' },
          location: { type: 'string' },
          phoneNumber: { type: 'string' },
          socialLinks: { 
            type: 'array',
            items: { type: 'string' }
          },
          workExperience: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                company: { type: 'string' },
                position: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time', nullable: true },
                current: { type: 'boolean' },
                description: { type: 'string' }
              },
              required: ['company', 'position', 'startDate', 'description']
            }
          }
        }
      }
    }
  }, userController.updateUserProfile);

  fastify.put<UpdatePasswordBody>('/api/users/password', {
    preValidation: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 6 }
        }
      }
    }
  }, userController.updatePassword);

  fastify.put('/api/users/profile-picture', {
    preValidation: [authenticate],
  }, userController.updateProfilePicture);

  done();
}
