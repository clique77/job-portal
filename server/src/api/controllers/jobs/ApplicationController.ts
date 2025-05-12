import { FastifyRequest, FastifyReply } from "fastify";
import { ApplicationService } from "../../../core/services/jobs/ApplicationService";
import { IErrorHandlerService } from "../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces";
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import { IApplicationService } from "../../../core/services/jobs/interfaces/IApplicationService";
import { ApplicationStatus } from "../../../data/models/ApplicationStatus";

interface ApplyToJobRequest {
  Params: { jobId: string };
  Body: { notes?: string; resumeId?: string };
}

interface WithdrawApplicationRequest {
  Params: { jobId: string };
}

interface UpdateApplicationStatusRequest {
  Params: { jobId: string; applicantId: string };
  Body: { status: ApplicationStatus; notes?: string };
}

interface GetJobApplicantsRequest {
  Params: { jobId: string };
}

interface GetUserApplicationsRequest {
  Querystring: { page?: number; limit?: number };
}

interface UpdateApplicationStatusProxyRequest {
  Body: {
    jobId: string;
    applicantId: string;
    status: ApplicationStatus;
    notes?: string;
  }
}

class ApplicationController {
  private applicationService: IApplicationService;
  private errorHandlerService: IErrorHandlerService;

  constructor(applicationService: IApplicationService, errorHandlerService: IErrorHandlerService) {
    this.applicationService = applicationService;
    this.errorHandlerService = errorHandlerService;

    this.applyToJob = this.applyToJob.bind(this);
    this.withdrawApplication = this.withdrawApplication.bind(this);
    this.getUserApplications = this.getUserApplications.bind(this);
    this.getJobApplicants = this.getJobApplicants.bind(this);
    this.updateApplicationStatus = this.updateApplicationStatus.bind(this);
    this.updateApplicationStatusProxy = this.updateApplicationStatusProxy.bind(this);
  }

  async applyToJob(request: FastifyRequest<ApplyToJobRequest>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      const { notes, resumeId } = request.body;
      // @ts-ignore
      const userId = request.user.id;
      
      console.log(`Application request for job ${jobId} from user ${userId}:`, {
        jobId,
        userId,
        notes: notes || 'No notes',
        hasResumeId: !!resumeId,
        resumeId: resumeId || 'No resume provided'
      });

      const result = await this.applicationService.applyToJob(jobId, userId, notes, resumeId);

      return reply.status(201).send({
        success: true,
        message: "Successfully applied to job",
        data: result
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async withdrawApplication(request: FastifyRequest<WithdrawApplicationRequest>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      // @ts-ignore
      const userId = request.user.id;

      const result = await this.applicationService.withdrawApplication(jobId, userId);

      return reply.status(200).send({
        success: true,
        message: "Application withdrawn successfully",
        data: result
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async getUserApplications(request: FastifyRequest<GetUserApplicationsRequest>, reply: FastifyReply) {
    try {
      // @ts-ignore
      const userId = request.user.id;
      const page = request.query.page || 1;
      const limit = request.query.limit || 10;

      const result = await this.applicationService.getUserApplications(userId, page, limit);

      return reply.status(200).send({
        success: true,
        message: "User applications retrieved successfully",
        data: result
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }

  async getJobApplicants(request: FastifyRequest<GetJobApplicantsRequest>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      // @ts-ignore
      const userId = request.user.id;

      const applicants = await this.applicationService.getJobApplicants(jobId, userId);

      return reply.status(200).send({
        success: true,
        message: "Job applicants retrieved successfully",
        data: applicants
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 403);
    }
  }

  async updateApplicationStatus(request: FastifyRequest<UpdateApplicationStatusRequest>, reply: FastifyReply) {
    try {
      const { jobId, applicantId } = request.params;
      const { status, notes } = request.body;
      // @ts-ignore
      const userId = request.user.id;

      const result = await this.applicationService.updateApplicationStatus(
        jobId,
        applicantId,
        status,
        userId,
        notes
      );

      return reply.status(200).send({
        success: true,
        message: "Application status updated successfully",
        data: result
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async updateApplicationStatusProxy(request: FastifyRequest<UpdateApplicationStatusProxyRequest>, reply: FastifyReply) {
    try {
      const { jobId, applicantId, status, notes } = request.body;
      
      // Log the incoming request data
      console.log('updateApplicationStatusProxy received:', {
        jobId, 
        applicantId, 
        status, 
        notes
      });
      
      // Validate the status is an allowed value
      const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEWED', 'REJECTED', 'OFFERED', 'HIRED', 'WITHDRAWN'];
      if (!validStatuses.includes(status)) {
        console.error(`Invalid status received: ${status}`);
        return reply.status(400).send({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      // @ts-ignore
      const userId = request.user.id;
      
      console.log(`Updating status for job: ${jobId}, applicant: ${applicantId}, status: ${status}`);

      const result = await this.applicationService.updateApplicationStatus(
        jobId,
        applicantId,
        status,
        userId,
        notes
      );

      console.log('Status update result:', result);

      return reply.status(200).send({
        success: true,
        message: "Application status updated successfully",
        data: result
      });
    } catch (error) {
      console.error('Error in updateApplicationStatusProxy:', error);
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }
}

const applicationController = new ApplicationController(
  ApplicationService,
  errorHandlerService
);

export default applicationController;
