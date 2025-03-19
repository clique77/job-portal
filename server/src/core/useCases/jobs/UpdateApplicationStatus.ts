import { ApplicationStatus, validStatusTransitions } from "../../../data/models/ApplicationStatus";
import { UserRole } from "../../../data/models/User";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";
import { IUpdateApplicationStatusUseCase } from "./interfaces/IApplicationUseCase";

export class UpdateApplicationStatus implements IUpdateApplicationStatusUseCase {
  private jobRepository: IJobRepository;
  private userService: UserService;

  constructor(jobRepository: IJobRepository, userService: UserService) {
    this.jobRepository = jobRepository;
    this.userService = userService;
  }

  async execute(jobId: string, applicantId: string, newStatus: ApplicationStatus, userId: string, notes?: string): Promise<boolean> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      const jobEmployerId = job.employer.toString();

      const isOwner = jobEmployerId === userId;

      const user = await this.userService.getUserById(userId);
      const isAdmin = user?.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new Error('You are not authorized to update this application');
      }

      const application = await this.jobRepository.getApplication(jobId, applicantId);

      if (!application) {
        throw new Error('Application not found');
      }

      const allowedNextStatuses = validStatusTransitions[application.status];
      if (!allowedNextStatuses.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${application.status} to ${newStatus}`);
      }

      const result = await this.jobRepository.updateApplicationStatus(jobId, applicantId, newStatus, notes);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
      throw new Error(`Failed to update application status: ${errorMessage}`);
    }
  }
}
