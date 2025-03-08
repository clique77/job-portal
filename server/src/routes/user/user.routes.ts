import { FastifyInstance } from 'fastify';
import userController from '../../api/user/user.controller';
import { authenticate } from '../../api/middleware/auth.middleware';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  fastify.get('/api/auth/me', {
    preValidation: [authenticate]
  }, userController.getCurrentUser);

  fastify.get('/api/users', {
    preValidation: [authenticate]
  }, userController.getAllUsers);

  done();
}
