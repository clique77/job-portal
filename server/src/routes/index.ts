import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes, { prefix: '/api/auth' });

  fastify.get('/api/health', async () => {
    return { status: 'ok', message: 'Server is running' };
  })
}
