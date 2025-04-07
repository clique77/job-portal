import { IJob } from "../../../../data/models/Jobs";
import { JobCreateData, JobFilter, JobUpdateDTO } from "../../../../data/repositories/jobs/JobRepository";

type getAllJobsOptions = {
  page?: number;
  limit?: number;
  filter?: JobFilter;
  sort?: { [key: string]: 1 | -1 };
}

type getAllJobsParams = {
  jobs: IJob[];
  total: number;
  pages: number;
}

export interface IJobService {
  createJob(jobData: JobCreateData, employerId: string): Promise<IJob>;
  updateJob(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null>;
  getJobById(jobId: string): Promise<IJob | null>;
  getAllJobs(options: getAllJobsOptions): Promise<getAllJobsParams>;
  deleteJob(jobId: string, userId: string): Promise<boolean>;
  
  saveJob(userId: string, jobId: string): Promise<boolean>;
  unsaveJob(userId: string, jobId: string): Promise<boolean>;
  getSavedJobs(userId: string): Promise<IJob[]>;
  isJobSaved(userId: string, jobId: string): Promise<boolean>;
}
