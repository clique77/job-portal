import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes);

  fastify.get('/api/health', async () => {
    return { status: 'ok', message: 'Server is running' };
  })
}
``
