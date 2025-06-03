import { FastifyInstance } from 'fastify';
import { authController } from '../../api/controllers/auth/AuthController';
import { authenticate } from '../../api/middleware/AuthMiddleware';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  fastify.post('/api/auth/register', authController.register);
  fastify.post('/api/auth/login', authController.login);
  fastify.get('/api/auth/logout', authController.logout);
  
  fastify.get('/api/auth/verify-email/:token', authController.verifyEmail);
  fastify.post('/api/auth/resend-verification', { preHandler: authenticate }, authController.resendVerification);

  done();
}
