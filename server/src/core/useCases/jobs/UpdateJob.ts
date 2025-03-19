import { IJobRepository, JobUpdateDTO } from '../../../data/repositories/jobs/JobRepository';
import { IJob } from '../../../data/models/Jobs';
import { UserService } from '../../services/users/UserService';
import { JobValidator } from './utils/JobValidator';

export class UpdateJobUseCase {
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
        throw new Error('Only the job creator or admin can update jobs');
      }

      this.validator.validateJobUpdateData(jobData);

      const updatedJob = await this.jobRepository.update(jobId, jobData);
      return updatedJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update job: ${errorMessage}`);
    }
  }
}
