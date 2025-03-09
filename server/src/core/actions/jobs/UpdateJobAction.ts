import { IJobRepository, JobUpdateDTO } from '../../../data/repositories/jobs/JobRepository';
import { IJob } from '../../../data/models/Jobs';
import { UserService } from '../../services/users/UserService';
import { JobValidator } from './utils/JobValidator';

export class UpdateJobAction {
  private jobRepository: IJobRepository;
  private userService: UserService;
  private validator: JobValidator;

  constructor(jobRepository: IJobRepository, userService: UserService, validator: JobValidator) {
    this.jobRepository = jobRepository;
    this.userService = userService;
    this.validator = validator;
  }

  async execute(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null> {
    try {
      const existingJob = await this.jobRepository.findById(jobId);

      if (!existingJob) {
        throw new Error('Job not found');
      }

      const isOwner = existingJob.employer.toString() === userId;
      const user = await this.userService.getUserById(userId);
      const isAdmin = user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        throw new Error('Only employer or admin can update jobs');
      }

      this.validator.validateJobUpdateData(jobData);

      const updatedJob = await this.jobRepository.update(jobId, jobData);
      return updatedJob;
    } catch (error) {
      console.error(`Error updating job ${jobId}: `, error);
      throw new Error('Failed to update job');
    }
  }
}
