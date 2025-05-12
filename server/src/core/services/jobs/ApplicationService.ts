import { ApplyToJob } from "../../useCases/jobs/ApplyToJob";
import { GetJobApplicants } from "../../useCases/jobs/GetJobApplicants";
import { GetUserApplications } from "../../useCases/jobs/GetUserApplications";
import { UpdateApplicationStatus } from "../../useCases/jobs/UpdateApplicationStatus";
import { WithdrawApplication } from "../../useCases/jobs/WithdrawApplication";
import { getJobRepository } from "../../../data/repositories/jobs/JobRepository";
import UserService from "../users/UserService";
import { ApplicationStatus } from "../../../data/models/ApplicationStatus";
import { IApplication } from "../../../data/models/Jobs";
import { IApplicationService } from "./interfaces/IApplicationService";
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
    this.updateApplicationStatusUseCase = new UpdateApplicationStatus(jobRepository);
  }

  async applyToJob(jobId: string, userId: string, notes?: string, resumeId?: string): Promise<boolean> {
    console.log(`Applying to job ${jobId} for user ${userId} with resumeId ${resumeId || 'none'}`);
    return this.applyToJobUseCase.execute(jobId, userId, notes, resumeId);
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
