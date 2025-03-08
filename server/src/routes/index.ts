import { FastifyInstance } from 'fastify';
import authRoutes from './auth/auth.routes'
import userRoutes from './user/user.routes';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes);
  fastify.register(userRoutes);

  fastify.get('/api/health', async () => {
    return { status: 'ok', message: 'Server is running' };
  })
}
``
