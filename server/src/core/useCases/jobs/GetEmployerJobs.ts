import { IJob } from "../../../data/models/Jobs";
import { UserRole } from "../../../data/models/User";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";

export interface IGetEmployerJobsUseCase {
  execute(employerId: string, userId: string, page?: number, limit?: number): Promise<{
    jobs: IJob[],
    total: number,
    pages: number
  }>;
}

export class GetEmployerJobs implements IGetEmployerJobsUseCase {
  private jobRepository: IJobRepository;
  private userService: UserService;

  constructor(jobRepository: IJobRepository, userService: UserService) {
    this.jobRepository = jobRepository;
    this.userService = userService;
  }

  async execute(employerId: string, userId: string, page: number = 1, limit: number = 10): Promise<{
    jobs: IJob[],
    total: number,
    pages: number
  }> {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isOwner = employerId === userId;
      const isAdmin = user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new Error('You are not authorized to view these jobs');
      }

      const skip = (page - 1) * limit;

      const jobs = await this.jobRepository.findByEmployer(employerId, skip, limit);

      const total = await this.jobRepository.count({ employer: employerId });
      const pages = Math.ceil(total / limit);

      return {
        jobs,
        total,
        pages
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get employer jobs: ${errorMessage}`);
    }
  }
}
