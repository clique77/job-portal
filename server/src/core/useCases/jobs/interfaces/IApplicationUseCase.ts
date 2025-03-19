import { ApplicationStatus } from "../../../../data/models/ApplicationStatus";
import { IApplication, IJob } from "../../../../data/models/Jobs";

export interface IApplyToJobUseCase {
    execute(jobId: string, applicantId: string): Promise<boolean>;
}

export interface IWithdrawApplicationUseCase {
  execute(jobId: string, applicantId: string): Promise<boolean>;
}

export interface IUpdateApplicationStatusUseCase {
  execute(
    jobId: string,
    applicantId: string,
    newStatus: ApplicationStatus,
    userId: string,
    notes?: string
  ): Promise<boolean>;
}

export interface IGetJobApplicationUseCase {
  execute(jobId: string, userId: string): Promise<IApplication[]>;
}

export interface IGetUserApplicationsUseCase {
  execute(userId: string, page?: number, limit?: number): Promise<{
    applications: Array<{ job: IJob, application: IApplication }>,
    total: number,
    pages: number,
  }>;
}
