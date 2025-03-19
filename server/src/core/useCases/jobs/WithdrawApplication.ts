import { ApplicationStatus } from "../../../data/models/ApplicationStatus";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { IWithdrawApplicationUseCase } from "./interfaces/IApplicationUseCase";

export class WithdrawApplication implements IWithdrawApplicationUseCase {
  private jobRepository: IJobRepository;

  constructor(jobRepository: IJobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(jobId: string, userId: string): Promise<boolean> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      const application = await this.jobRepository.getApplication(jobId, userId);

      if (!application) {
        throw new Error('Application not found');
      }

      if (application.status !== ApplicationStatus.PENDING &&
        application.status !== ApplicationStatus.UNDER_REVIEW) {
        throw new Error('Application is not in pending or under review');
      }

      const result = await this.jobRepository.removeApplicant(jobId, userId);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
      throw new Error(`Failed to withdraw application: ${errorMessage}`);
    }
  }
}
