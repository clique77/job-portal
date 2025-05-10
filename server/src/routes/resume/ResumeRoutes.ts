import { FastifyInstance } from "fastify";
import { resumeController } from "../../api/controllers/Resume/ResumeController";
import { authenticate, checkRole } from "../../api/middleware/AuthMiddleware";
import { UserRole } from "../../data/models/User";

export default function(fastify: FastifyInstance, _options: any, done: () => void) {
  fastify.get('/api/resumes', {
    preHandler: [authenticate, checkRole([UserRole.JOB_SEEKER])]
  }, resumeController.getUserResumes);

  fastify.get<{
    Params: { id: string }
  }>('/api/resumes/:id', {
    preHandler: [authenticate]
  }, resumeController.getResumeById);

  fastify.post('/api/resumes', {
    preHandler: [authenticate, checkRole([UserRole.JOB_SEEKER])],
  }, resumeController.createResume);

  fastify.delete<{
    Params: { id: string }
  }>('/api/resumes/:id', {
    preHandler: [authenticate, checkRole([UserRole.JOB_SEEKER])]
  }, resumeController.deleteResume);

  done();
}