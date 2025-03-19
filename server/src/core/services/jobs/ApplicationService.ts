import { ApplyToJob } from "../../useCases/jobs/ApplyToJob";
import { GetJobApplicants } from "../../useCases/jobs/GetJobApplicants";
import { GetUserApplications } from "../../useCases/jobs/GetUserApplications";
import { UpdateApplicationStatus } from "../../useCases/jobs/UpdateApplicationStatus";
import { WithdrawApplication } from "../../useCases/jobs/WithdrawApplication";
import { getJobRepository } from "../../../data/repositories/jobs/JobRepository";
import UserService from "../users/UserService";
import { ApplicationStatus } from "../../../data/models/ApplicationStatus";
import { IApplication, IJob } from "../../../data/models/Jobs";

export interface IApplicationService {
  applyToJob(jobId: string, userId: string, notes?: string): Promise<boolean>;
  withdrawApplication(jobId: string, userId: string): Promise<boolean>;
  getUserApplications(userId: string, page?: number, limit?: number): Promise<{
    applications: Array<{job: IJob, application: IApplication}>,
    total: number,
    pages: number
  }>;
  getJobApplicants(jobId: string, userId: string): Promise<IApplication[]>;
  updateApplicationStatus(
    jobId: string,
    applicantId: string,
    status: ApplicationStatus,
    userId: string,
    notes?: string
  ): Promise<boolean>;
}

class ApplicationServiceImpl implements IApplicationService {
  private applyToJobUseCase: ApplyToJob;
  private withdrawApplicationUseCase: WithdrawApplication;
  private getUserApplicationsUseCase: GetUserApplications;
  private getJobApplicantsUseCase: GetJobApplicants;
  private updateApplicationStatusUseCase: UpdateApplicationStatus;

  constructor() {
    const jobRepository = getJobRepository();
    const userService = UserService;

    this.applyToJobUseCase = new ApplyToJob(jobRepository, userService);
    this.withdrawApplicationUseCase = new WithdrawApplication(jobRepository);
    this.getUserApplicationsUseCase = new GetUserApplications(jobRepository);
    this.getJobApplicantsUseCase = new GetJobApplicants(jobRepository, userService);
    this.updateApplicationStatusUseCase = new UpdateApplicationStatus(jobRepository, userService);
  }

  async applyToJob(jobId: string, userId: string, notes?: string): Promise<boolean> {
    return this.applyToJobUseCase.execute(jobId, userId, notes);
  }

  async withdrawApplication(jobId: string, userId: string): Promise<boolean> {
    return this.withdrawApplicationUseCase.execute(jobId, userId);
  }

  async getUserApplications(userId: string, page: number = 1, limit: number = 10) {
    return this.getUserApplicationsUseCase.execute(userId, page, limit);
  }

  async getJobApplicants(jobId: string, userId: string): Promise<IApplication[]> {
    return this.getJobApplicantsUseCase.execute(jobId, userId);
  }

  async updateApplicationStatus(
    jobId: string,
    applicantId: string,
    status: ApplicationStatus,
    userId: string,
    notes?: string
  ): Promise<boolean> {
    return this.updateApplicationStatusUseCase.execute(jobId, applicantId, status, userId, notes);
  }
}

export const ApplicationService = new ApplicationServiceImpl();
