import { FastifyInstance } from 'fastify';
import userController from '../../api/controllers/user/UserController';
import { authenticate } from '../../api/middleware/AuthMiddleware';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  fastify.get('/api/auth/me', {
    preValidation: [authenticate]
  }, userController.getCurrentUser);

  fastify.get('/api/users', {
    preValidation: [authenticate]
  }, userController.getAllUsers);

  done();
}
