import { FastifyInstance } from 'fastify';
import authRoutes from './auth/AuthRoutes'
import userRoutes from './user/UserRoutes';
import jobRoutes from './job/jobRoutes';
import applicationRoutes from './job/ApplicationRoutes';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes);
  fastify.register(userRoutes);
  fastify.register(jobRoutes);
  fastify.register(applicationRoutes);

  fastify.get('/api/health', async () => {
    return { status: 'ok', message: 'Server is running' };
  })
}
``
