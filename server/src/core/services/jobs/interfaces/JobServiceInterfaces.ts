import { IJob } from "../../../../data/models/Jobs";
import { JobCreateData, JobFilter, JobUpdateDTO } from "../../../../data/repositories/jobs/JobRepository";

export interface IJobService {
  createJob(jobData: JobCreateData, employerId: string): Promise<IJob>;
  updateJob(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null>;
  getJobById(jobId: string): Promise<IJob | null>;
  getAllJobs(options: {
    page?: number,
    limit?: number,
    filter?: JobFilter,
    sort?: { [key: string]: 1 | -1 }
  }): Promise<{
    jobs: IJob[],
    total: number,
    pages: number
  }>;
  deleteJob(jobId: string, userId: string): Promise<boolean>;
}
