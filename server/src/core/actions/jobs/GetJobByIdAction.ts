import { IJobRepository } from '../../../data/repositories/jobs/JobRepository';
import { IJob } from '../../../data/models/Jobs';

export class GetJobByIdAction {
  private jobRepository: IJobRepository;

  constructor(jobRepository: IJobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(jobId: string): Promise<IJob | null> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      return job;
    } catch (error) {
      console.error(`Error finding job ${jobId}:`, error);
      throw new Error('Failed to fetch job');
    }
  }
}
