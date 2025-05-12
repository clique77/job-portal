import { FastifyInstance } from "fastify";
import applicationController from "../../api/controllers/jobs/ApplicationController";
import { authenticate, checkRole } from "../../api/middleware/AuthMiddleware";
import { UserRole } from "../../data/models/User";
import { ApplicationStatus } from "../../data/models/ApplicationStatus";

export default function(fastify: FastifyInstance, _options: any, done: () => void) {
  fastify.post<{
    Params: { jobId: string },
    Body: { notes?: string }
  }>('/api/jobs/:jobId/apply', {
    preHandler: [authenticate]
  }, applicationController.applyToJob);

  fastify.delete<{
    Params: { jobId: string }
  }>('/api/jobs/:jobId/withdraw', {
    preHandler: [authenticate]
  }, applicationController.withdrawApplication);

  fastify.get<{
    Querystring: { page?: number, limit?: number }
  }>('/api/me/applications', {
    preHandler: [authenticate]
  }, applicationController.getUserApplications);

  fastify.get<{
    Params: { jobId: string }
  }>('/api/jobs/:jobId/applicants', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER, UserRole.ADMIN])]
  }, applicationController.getJobApplicants);

  fastify.patch<{
    Params: { jobId: string, applicantId: string },
    Body: { status: ApplicationStatus, notes?: string }
  }>('/api/jobs/:jobId/applicants/:applicantId/status', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER, UserRole.ADMIN])]
  }, applicationController.updateApplicationStatus);
  
  fastify.post<{
    Body: { 
      jobId: string,
      applicantId: string,
      status: ApplicationStatus, 
      notes?: string 
    }
  }>('/api/applications/update-status', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER, UserRole.ADMIN])]
  }, applicationController.updateApplicationStatusProxy);

  done();
}
