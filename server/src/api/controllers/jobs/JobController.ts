import { FastifyRequest, FastifyReply } from "fastify";
import { IErrorHandlerService } from "../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces";
import { IPaginationService } from "../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces";
import { IJobService } from "../../../core/services/jobs/interfaces/JobServiceInterfaces";
import { JobCreateData, JobFilter, JobUpdateData } from "../../../data/repositories/jobs/JobRepository";
import { JobType } from "../../../data/models/Jobs";

interface GetJobParams {
  id: string;
}

interface JobFilterQuery {
  title?: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
  }
  type?: JobType;
  tags?: string[];
  status?: string;
}

class JobController {
  private jobService: IJobService;
  private errorHandlerService: IErrorHandlerService;
  private paginationService: IPaginationService;

  constructor(jobService: IJobService, errorHandlerService: IErrorHandlerService, paginationService: IPaginationService) {
    this.jobService = jobService;
    this.errorHandlerService = errorHandlerService;
    this.paginationService = paginationService;

    this.createJob = this.createJob.bind(this);
    this.getAllJobs = this.getAllJobs.bind(this);
    this.getJobById = this.getJobById.bind(this);
    this.updateJob = this.updateJob.bind(this);
    this.deleteJob = this.deleteJob.bind(this);
  }

  async createJob(request: FastifyRequest<{ Body: JobCreateData }>, reply: FastifyReply) {
    try {
      const jobData = request.body;
      //@ts-ignore
      const userId = request.user.id;

      const job = await this.jobService.createJob(jobData, userId);

      return reply.status(201).send({ message: "Job created successfully", job });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async getJobById(request: FastifyRequest<{ Params: GetJobParams }>, reply: FastifyReply) {
    try {
      const jobId = request.params.id;
      const job = await this.jobService.getJobById(jobId);

      if (!job) {
        return reply.status(404).send({ message: "Job not found" });
      }

      return reply.status(200).send({ message: "Job fetched successfully", job });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }

  async getAllJobs(request: FastifyRequest<{ Querystring: JobFilterQuery }>, reply: FastifyReply) {
    try {
      const { title, location, salary, type, tags, status } = request.query;
      const { page, limit } = this.paginationService.getPaginationParams(request);

      const filter: JobFilter = {
        title,
        location,
        salary,
        type,
        tags,
        status,
      }

      const result = await this.jobService.getAllJobs({ page, limit, filter });
      
      return reply.status(200).send({
        data: result.jobs,
        meta: {
          total: result.total,
          pages: result.pages,
          page: page
        }
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }

  async updateJob(request: FastifyRequest<{ Params: GetJobParams, Body: JobUpdateData }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const jobData = request.body;
      //@ts-ignore
      const userId = request.user.id;

      const updatedJob = await this.jobService.updateJob(id, jobData, userId);

      if (!updatedJob) {
        return reply.status(404).send({ message: "Job not found" });
      }

      return reply.status(200).send({ message: "Job updated successfully", job: updatedJob });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }

  async deleteJob(request: FastifyRequest<{ Params: GetJobParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const deletedJob = await this.jobService.deleteJob(id, userId);

      if (!deletedJob) {
        return reply.status(404).send({ message: 'Job not found' });
      }

      return reply.status(200).send({ message: 'Job deleted successfully' });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }
}

import jobService  from '../../../core/services/jobs/JobService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import paginationService from '../../../core/services/common/pagination/PaginationService';

export const jobController = new JobController(jobService, errorHandlerService, paginationService);
export default jobController;
