import { IJobRepository } from '../../../data/repositories/jobs/JobRepository';
import { UserService } from '../../services/users/UserService';
import { IDeleteJobUseCase } from './interfaces/IJobUseCase';

export class DeleteJobUseCase implements IDeleteJobUseCase {
  private jobRepository: IJobRepository;
  private userService: UserService;

  constructor(jobRepository: IJobRepository, userService: UserService) {
    this.jobRepository = jobRepository;
    this.userService = userService;
  }

  async execute(jobId: string, userId: string): Promise<boolean> {
    try {
      const existingJob = await this.jobRepository.findById(jobId);

      if (!existingJob) {
        throw new Error('Job not found');
      }

      let jobEmployerId: string;

      if (typeof existingJob.employer === 'object' && existingJob.employer !== null) {
        if (existingJob.employer._id) {
          jobEmployerId = existingJob.employer._id.toString();
        } else {
          jobEmployerId = (existingJob.employer as any).toString();
        }
      } else {
        jobEmployerId = String(existingJob.employer);
      }

      const isOwner = jobEmployerId === userId;

      const user = await this.userService.getUserById(userId);
      const isAdmin = user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new Error('Only the job creator or admin can delete jobs');
      }

      await this.jobRepository.delete(jobId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete job: ${errorMessage}`);
    }
  }
}
