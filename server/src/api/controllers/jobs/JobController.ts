import { FastifyRequest, FastifyReply } from "fastify";
import { IErrorHandlerService } from "../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces";
import { IPaginationService } from "../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces";
import { IJobService } from "../../../core/services/jobs/interfaces/JobServiceInterfaces";
import { JobCreateData, JobFilter, JobUpdateData } from "../../../data/repositories/jobs/JobRepository";
import { JobType } from "../../../data/models/Jobs";
import { getUserCompanyRepository } from "../../../data/repositories/UserCompany/UserCompanyRepository";
import Jobs, { IJob } from "../../../data/models/Jobs";
import { IUserCompany } from "../../../data/models/UserCompany";

interface GetJobParams {
  id: string;
}

interface JobIdParams {
  jobId: string;
}

interface JobFilterQuery {
  title?: string;
  location?: string;
  company?: string;
  employer?: string;
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
    this.saveJob = this.saveJob.bind(this);
    this.unsaveJob = this.unsaveJob.bind(this);
    this.isJobSaved = this.isJobSaved.bind(this);
    this.getSavedJobs = this.getSavedJobs.bind(this);
    this.getUniqueLocations = this.getUniqueLocations.bind(this);
    this.getCompanyJobs = this.getCompanyJobs.bind(this);
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
      const { title, location, company, salary, type, tags, status, employer } = request.query;
      const { page, limit } = this.paginationService.getPaginationParams(request);

      console.log("Jobs API - Filter params:", { 
        title, 
        location, 
        company, 
        type, 
        status, 
        employer 
      });
      
      const filter: JobFilter = {
        title,
        location,
        company,
        salary,
        type,
        tags,
        status,
        employer
      }

      const result = await this.jobService.getAllJobs({ page, limit, filter });
      console.log(`Jobs API - Found ${result.jobs.length} jobs for filter`, filter);
      
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

  async saveJob(request: FastifyRequest<{ Params: JobIdParams }>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const result = await this.jobService.saveJob(userId, jobId);

      return reply.status(200).send({
        success: true,
        message: result ? "Job saved successfully" : "Job was already saved"
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async unsaveJob(request: FastifyRequest<{ Params: JobIdParams }>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const result = await this.jobService.unsaveJob(userId, jobId);

      return reply.status(200).send({
        success: true,
        message: result ? "Job unsaved successfully" : "Job was not saved"
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async isJobSaved(request: FastifyRequest<{ Params: JobIdParams }>, reply: FastifyReply) {
    try {
      const { jobId } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const isSaved = await this.jobService.isJobSaved(userId, jobId);

      return reply.status(200).send(isSaved);
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async getSavedJobs(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;

      const savedJobs = await this.jobService.getSavedJobs(userId);

      return reply.status(200).send({
        success: true,
        data: savedJobs
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 400);
    }
  }

  async getUniqueLocations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const locations = await this.jobService.getUniqueLocations();
      
      return reply.status(200).send({
        success: true,
        data: locations
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }

  async getCompanyJobs(request: FastifyRequest<{ Params: { companyId: string } }>, reply: FastifyReply) {
    try {
      const { companyId } = request.params;
      const { page, limit } = this.paginationService.getPaginationParams(request);
      
      console.log(`Getting jobs for company ID: ${companyId}`);
      
      // Get company details
      const companyService = require('../../../core/services/company/CompanyService').default;
      const company = await companyService.getCompanyById(companyId);
      
      if (!company) {
        console.log(`Company with ID ${companyId} not found`);
        return reply.status(200).send([]);
      }
      
      console.log(`Found company: ${company.name}`);

      // Get UserCompany relationships for this company
      const userCompanyRepository = getUserCompanyRepository();
      const companyMembers = await userCompanyRepository.findByCompany(companyId);
      
      console.log(`Found ${companyMembers.length} members for company ${companyId}`);
      
      let allJobs: IJob[] = [];
      
      // 1. First approach: Use company name to find jobs
      const nameFilter: JobFilter = { company: company.name };
      const companyNameResults = await this.jobService.getAllJobs({ 
        page: 1, 
        limit: 100, 
        filter: nameFilter,
        sort: { createdAt: -1 } 
      });
      
      console.log(`Found ${companyNameResults.jobs.length} jobs with company name "${company.name}"`);
      allJobs = allJobs.concat(companyNameResults.jobs);
      
      // 2. Second approach: Find jobs created by company members
      if (companyMembers.length > 0) {
        console.log('Fetching jobs for company members...');
        
        const memberUserIds = companyMembers.map((member: IUserCompany) => member.userId.toString());
        
        for (const userId of memberUserIds) {
          console.log(`Finding jobs for company member: ${userId}`);
          const userJobs = await this.jobService.findByEmployer(userId, 0, 20);
          console.log(`Found ${userJobs.length} jobs for company member ${userId}`);
          
          // Add jobs if not already in the results 
          userJobs.forEach((job: IJob) => {
            if (!allJobs.some(existingJob => existingJob._id?.toString() === job._id?.toString())) {
              allJobs.push(job);
            }
          });
        }
      }
      
      // Sort final results by date descending
      allJobs.sort((a: IJob, b: IJob) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`Found total of ${allJobs.length} unique jobs for company ${company.name}`);
      
      return reply.status(200).send(allJobs);
    } catch (error) {
      console.error('Error in getCompanyJobs:', error);
      return this.errorHandlerService.handleError(request, reply, (error as Error), 500);
    }
  }
}

import jobService from '../../../core/services/jobs/JobService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import paginationService from '../../../core/services/common/pagination/PaginationService';

export const jobController = new JobController(jobService, errorHandlerService, paginationService);
export default jobController;
