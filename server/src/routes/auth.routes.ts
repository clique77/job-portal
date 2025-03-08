import { FastifyInstance } from 'fastify';
import AuthController from '../controllers/auth.controller';
import { authenticate, checkRole } from '../middleware/auth.middleware';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', AuthController.register);

  fastify.post('/login', AuthController.login);

  fastify.get('/me', {
    preHandler: [authenticate],
  }, AuthController.getCurrentUser);

  fastify.get('/users', {
    preHandler: [authenticate, checkRole(['admin'])]
  }, AuthController.getAllUsers);

  fastify.post('/logout', AuthController.logout);

  //TODO: Додати ендпоінт для оновлення користувачів.
  //TODO: Додати ендпоінт для видаллення користувачів.
  //TODO: Додати ендпоінт для пошуку користувачів по id.
}
