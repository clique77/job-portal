import { FastifyInstance } from "fastify";
import jobController from "../../api/controllers/jobs/JobController";
import { authenticate, checkRole } from "../../api/middleware/AuthMiddleware";
import { UserRole } from "../../data/models/User";
import { JobCreateData, JobUpdateData } from "../../data/repositories/jobs/JobRepository"; // Import these types

export default function(fastify: FastifyInstance, _options: any, done: () => void) {
  fastify.get('/api/jobs', jobController.getAllJobs);

  fastify.get<{
    Params: { id: string }
  }>('/api/getJob/:id', jobController.getJobById);

  fastify.get<{
    Params: { companyId: string }
  }>('/api/companies/:companyId/jobs', jobController.getCompanyJobs);

  fastify.post<{
    Body: JobCreateData
  }>('/api/createJob', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER])]
  }, jobController.createJob);

  fastify.put<{
    Params: { id: string },
    Body: JobUpdateData
  }>('/api/updateJob/:id', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER])]
  }, jobController.updateJob);

  fastify.delete<{
    Params: { id: string }
  }>('/api/deleteJob/:id', {
    preHandler: [authenticate, checkRole([UserRole.EMPLOYER])]
  }, jobController.deleteJob);

  fastify.post<{
    Params: { jobId: string }
  }>('/api/jobs/:jobId/save', {
    preHandler: [authenticate]
  }, jobController.saveJob);

  fastify.delete<{
    Params: { jobId: string }
  }>('/api/jobs/:jobId/save', {
    preHandler: [authenticate]
  }, jobController.unsaveJob);

  fastify.get<{
    Params: { jobId: string }
  }>('/api/jobs/:jobId/saved', {
    preHandler: [authenticate]
  }, jobController.isJobSaved);

  fastify.get('/api/jobs/saved', {
    preHandler: [authenticate]
  }, jobController.getSavedJobs);

  fastify.get('/api/jobs/locations', jobController.getUniqueLocations);

  done();
}
