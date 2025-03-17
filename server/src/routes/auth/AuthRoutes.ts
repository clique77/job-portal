import { FastifyInstance } from 'fastify';
import authController from '../../api/controllers/auth/AuthController';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  fastify.post('/api/auth/register', authController.register);
  fastify.post('/api/auth/login', authController.login);
  fastify.get('/api/auth/logout', authController.logout);

  done();
}
