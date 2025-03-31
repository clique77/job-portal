import { IJob, JobType } from '../../models/Jobs';
import { ApplicationStatus } from '../../models/ApplicationStatus';
import { IApplication } from '../../models/Jobs';

export interface JobCreateData {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    current: string;
  };
  type: JobType;
  category: string;
  tags: string[];
  employer: string;
  status?: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  applicants?: string[];
  createdAt?: Date;
  expiresAt?: Date;
}

export interface JobUpdateData {
  requirements?: string[];
}

export interface JobFilter {
  title?: string;
  category?: string;
  location?: string;
  type?: JobType;
  salary?: {
    min?: number;
    max?: number;
  };
  search?: string;
  employer?: string;
  status?: string;
  tags?: string[];
  applicantId?: string;
}

export interface JobUpdateDTO extends Omit<JobFilter, 'employer'> {
  description?: string;
  requirements?: string[];
  benefits?: string[];
  deadline?: Date;
  responsibilities?: string[];
  isRemote?: boolean;
}

export interface IJobRepository {
  create(jobData: JobCreateData): Promise<IJob>;
  findById(id: string): Promise<IJob | null>;
  update(id: string, jobData: JobUpdateData): Promise<IJob | null>;
  delete(id: string): Promise<boolean>;
  findAll(skip: number, limit: number, filter?: JobFilter, sort?: { [key: string]: 1 | -1 }): Promise<IJob[]>;
  findByEmployer(employerId: string, skip: number, limit: number): Promise<IJob[]>;
  count(filter?: JobFilter): Promise<number>;
  search(query: string, skip: number, limit: number): Promise<IJob[]>;
  addApplicant(jobId: string, applicationData: {
    applicant: string,
    status?: ApplicationStatus,
    notes?: string
  }): Promise<boolean>;
  removeApplicant(jobId: string, applicantId: string): Promise<boolean>;
  getApplicants(jobId: string): Promise<IApplication[]>;
  updateApplicationStatus(
    jobId: string,
    applicantId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<boolean>;
  getApplication(jobId: string, applicantId: string): Promise<IApplication | null>;
  findJobsByApplicant(applicantId: string, skip: number, limit: number): Promise<IJob[]>;
}

export const getJobRepository = (): IJobRepository => {
  const { JobMongoDBRepository } = require('./JobMongoDbRepository');
  return new JobMongoDBRepository();
}


