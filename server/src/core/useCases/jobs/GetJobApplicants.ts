import { IApplication } from "../../../data/models/Jobs";
import { UserRole } from "../../../data/models/User";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";

export class GetJobApplicants {
  private jobRepository: IJobRepository;
  private userService: UserService;

  constructor(jobRepository: IJobRepository, userService: UserService) {
    this.jobRepository = jobRepository;
    this.userService = userService;
  }

  async execute(jobId: string, userId: string): Promise<IApplication[]> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const jobEmployerId = job.employer.toString();
      const isOwner = jobEmployerId === userId;
      const isAdmin = user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new Error('You are not authorized to view this job applicants');
      }

      const applicants = await this.jobRepository.getApplicants(jobId);

      return applicants;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown Error';
      throw new Error(`Failed to fetch job applicants: ${errorMessage}`);
    }
  }
}
