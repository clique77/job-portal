import { ApplicationStatus } from "../../../data/models/ApplicationStatus";
import { UserRole } from "../../../data/models/User";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";
import { IApplyToJobUseCase } from "./interfaces/IApplicationUseCase";

export class ApplyToJob implements IApplyToJobUseCase {
  private jobRepository: IJobRepository;
  private userService: UserService;

  constructor(jobRepository: IJobRepository, userService: UserService) {
    this.jobRepository = jobRepository;
    this.userService = userService;
  }

  async execute(jobId: string, userId: string, notes?: string): Promise<boolean> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status !== 'ACTIVE') {
        throw new Error('Job is not active');
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === UserRole.EMPLOYER || user.role === UserRole.ADMIN) {
        throw new Error('Employers cannot apply to jobs');
      }

      const existingApplication = await this.jobRepository.getApplication(jobId, userId);
      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      const applicationData = {
        applicant: userId,
        status: ApplicationStatus.PENDING,
        notes: notes || '',
      }

      const result = await this.jobRepository.addApplicant(jobId, applicationData);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to apply to job: ${errorMessage}`)
    }
  }
}
