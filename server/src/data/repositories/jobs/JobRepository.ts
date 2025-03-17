import { IJob, JobType } from '../../models/Jobs';

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
  employer?: string;
  status?: string;
  tags?: string[];
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
  addApplicant(jobId: string, applicantId: string): Promise<boolean>;
  removeApplicant(jobId: string, applicantId: string): Promise<boolean>;
  getApplicants(jobId: string): Promise<string[]>;
}

export const getJobRepository = (): IJobRepository => {
  const { JobMongoDBRepository } = require('./JobMongoDbRepository');
  return new JobMongoDBRepository();
}


