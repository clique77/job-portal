import { IJob } from "../../../../data/models/Jobs";
import { JobCreateData, JobFilter, JobUpdateDTO } from "../../../../data/repositories/jobs/JobRepository";

export interface ICreateJobAction {
  execute(jobData: JobCreateData, employerId: string): Promise<IJob>;
}

export interface IUpdateJobAction {
  execute(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null>;
}

export interface IGetJobByIdAction {
  execute(jobId: string): Promise<IJob | null>;
}

export interface IListJobsAction {
  execute(filter?: JobFilter, page?: number, limit?: number): Promise<{
    jobs: IJob[],
    total: number
  }>;
}

export interface IDeleteJobAction {
  execute(jobId: string, userId: string): Promise<boolean>;
}
