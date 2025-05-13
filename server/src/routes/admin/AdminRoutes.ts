import { FastifyInstance } from 'fastify';
import adminController from '../../api/controllers/admin/AdminController';
import { authenticate } from '../../api/middleware/AuthMiddleware';
import { checkAdminRole } from '../../api/middleware/RoleMiddleware';
import Job, { IJob } from '../../data/models/Jobs';

export default function(fastify: FastifyInstance, _opts: any, done: () => void) {
  console.log('Registering admin routes...');
  
  // Apply admin role check to all routes
  fastify.addHook('preValidation', authenticate);
  fastify.addHook('preValidation', checkAdminRole);
  
  // User Management Routes
  fastify.get('/api/admin/users', adminController.getAllUsers);
  fastify.get('/api/admin/users/:id', adminController.getUserById);
  fastify.post('/api/admin/users', adminController.createUser);
  fastify.put('/api/admin/users/:id', adminController.updateUser);
  fastify.delete('/api/admin/users/:id', adminController.deleteUser);
  
  // Job Management Routes
  fastify.get('/api/admin/jobs', adminController.getAllJobs);
  fastify.get('/api/admin/jobs/:id', adminController.getJobById);
  fastify.put('/api/admin/jobs/:id', adminController.updateJob);
  fastify.delete('/api/admin/jobs/:id', adminController.deleteJob);
  
  // Company Management Routes
  fastify.get('/api/admin/companies', adminController.getAllCompanies);
  fastify.get('/api/admin/companies/:id', adminController.getCompanyById);
  fastify.post('/api/admin/companies', adminController.createCompany);
  fastify.put('/api/admin/companies/:id', adminController.updateCompany);
  fastify.delete('/api/admin/companies/:id', adminController.deleteCompany);
  
  // Application Management Routes
  console.log('Registering admin application routes...');
  fastify.get('/api/admin/applications', adminController.getAllApplications);
  fastify.get('/api/admin/applications/:id', adminController.getApplicationById);
  fastify.put('/api/admin/applications/:id/status', adminController.updateApplicationStatus);
  
  // Add a DELETE endpoint for applications
  fastify.delete('/api/admin/applications/:id', async (request: any, reply) => {
    try {
      const { id } = request.params;
      console.log(`Admin API: Attempting to delete application with ID: ${id}`);
      
      // The ID is in format jobId_applicantId
      const [jobId, applicantId] = id.split('_');
      
      if (!jobId || !applicantId) {
        return reply.code(400).send({ error: 'Invalid application ID format' });
      }
      
      // Find job
      const jobDoc = await Job.findById(jobId);
      
      if (!jobDoc) {
        console.log(`Admin API: Job with ID ${jobId} not found for deletion`);
        return reply.code(404).send({ error: 'Job not found' });
      }
      
      const job = jobDoc as unknown as IJob;
      
      // Find the specific applicant index
      const applicantIndex = job.applicants?.findIndex(app => 
        (app.applicant?._id?.toString() === applicantId) || 
        (app.applicant?.toString() === applicantId)
      );
      
      if (applicantIndex === undefined || applicantIndex === -1) {
        console.log(`Admin API: Applicant with ID ${applicantId} not found in job`);
        return reply.code(404).send({ error: 'Application not found' });
      }
      
      console.log(`Admin API: Removing applicant at index ${applicantIndex} from job ${jobId}`);
      
      // Remove the applicant from the array
      job.applicants.splice(applicantIndex, 1);
      
      // Save the job
      await job.save();
      
      console.log(`Admin API: Successfully removed applicant ${applicantId} from job ${jobId}`);
      return reply.code(204).send();
    } catch (error) {
      console.error('Error deleting application:', error);
      return reply.code(500).send({ error: 'Failed to delete application' });
    }
  });
  
  // Add a test endpoint to check applications
  fastify.get('/api/admin/check-applications', async (request, reply) => {
    try {
      console.log('Checking applications in database...');
      
      // Count application documents
      const jobCount = await Job.countDocuments({ 'applicants.0': { $exists: true } });
      console.log(`Found ${jobCount} jobs with applicants`);
      
      // Fetch one job with applicants as a sample
      const sampleJob = await Job.findOne({ 'applicants.0': { $exists: true } })
        .populate('applicants.applicant', 'name email')
        .lean();
      
      let totalApplicantsEstimate = "Unknown";
      if (sampleJob && sampleJob.applicants) {
        if (Array.isArray(sampleJob.applicants)) {
          totalApplicantsEstimate = `At least ${sampleJob.applicants.length} (from one job)`;
        }
      }
      
      // Return simplified information for debugging
      return reply.send({
        success: true,
        jobsWithApplicants: jobCount,
        totalApplicantsEstimate,
        sampleJob: sampleJob ? {
          jobId: sampleJob._id,
          title: sampleJob.title,
          applicantsCount: sampleJob.applicants?.length || 0
        } : 'No sample available'
      });
    } catch (error) {
      console.error('Error checking applications:', error);
      return reply.code(500).send({ error: 'Failed to check applications' });
    }
  });
  
  console.log('Admin routes registered successfully');
  done();
} 