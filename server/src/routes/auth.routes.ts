import { FastifyInstance } from 'fastify';
import authController from '../api/auth/auth.controller';
import userController from '../api/user/user.controller';
import { authenticate } from '../api/middleware/auth.middleware';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  // Маршрути автентифікації
  fastify.post('/api/auth/register', authController.register);
  fastify.post('/api/auth/login', authController.login);
  fastify.get('/api/auth/logout', authController.logout);

  // Маршрути користувачів
  fastify.get('/api/auth/me', {
    preValidation: [authenticate]
  }, userController.getCurrentUser);

  fastify.get('/api/users', {
    preValidation: [authenticate]
  }, userController.getAllUsers);

  done();
}
