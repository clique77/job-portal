import { IJobRepository } from '../../../data/repositories/jobs/JobRepository';
import { UserService } from '../../services/users/UserService';
import { IDeleteJobAction } from './interfaces/IJobActions';

export class DeleteJobAction implements IDeleteJobAction {
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

      const isOwner = existingJob.employer.toString() === userId;
      const user = await this.userService.getUserById(userId);
      const isAdmin = user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new Error('Only employer or admin can delete jobs');
      }

      await this.jobRepository.delete(jobId);
      return true;
    } catch (error) {
      console.error(`Error deleting job ${jobId}: `, error);
      throw new Error('Failed to delete job');
    }
  }
}
