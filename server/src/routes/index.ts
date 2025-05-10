import { FastifyInstance } from 'fastify';
import authRoutes from './auth/AuthRoutes'
import userRoutes from './user/UserRoutes';
import jobRoutes from './job/jobRoutes';
import applicationRoutes from './job/ApplicationRoutes';
import resumeRoutes from './resume/ResumeRoutes';
import companyRoutes from './company/CompanyRoutes';
import userCompanyRoutes from './company/UserCompanyRoutes';

export default async function routes(fastify: FastifyInstance) {
  fastify.register(authRoutes);
  fastify.register(userRoutes);
  fastify.register(jobRoutes);
  fastify.register(applicationRoutes);
  fastify.register(resumeRoutes);
  fastify.register(companyRoutes);
  fastify.register(userCompanyRoutes);

  fastify.get('/api/health', async () => {
    return { status: 'ok', message: 'Server is running' };
  })
}
