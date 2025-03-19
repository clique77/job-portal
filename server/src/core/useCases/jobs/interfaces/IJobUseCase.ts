import { IJob } from "../../../../data/models/Jobs";
import { JobCreateData, JobFilter, JobUpdateDTO } from "../../../../data/repositories/jobs/JobRepository";

export interface ICreateJobUseCase {
  execute(jobData: JobCreateData, employerId: string): Promise<IJob>;
}

export interface IUpdateJobUseCase {
  execute(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null>;
}

export interface IGetJobByIdUseCase {
  execute(jobId: string): Promise<IJob | null>;
}

export interface IListJobsUseCase {
  execute(filter?: JobFilter, page?: number, limit?: number): Promise<{
    jobs: IJob[],
    total: number
  }>;
}

export interface IDeleteJobUseCase {
  execute(jobId: string, userId: string): Promise<boolean>;
}
