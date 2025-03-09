import { IJobRepository, JobFilter } from '../../../data/repositories/jobs/JobRepository';
import { IJob } from '../../../data/models/Jobs';
import { JobFilterBuilder } from './utils/JobFilterBuilder';

export class ListJobsAction {
  private jobRepository: IJobRepository;
  private filterBuilder: JobFilterBuilder;

  constructor(jobRepositoryBuilder: IJobRepository, filterBuilder: JobFilterBuilder) {
    this.jobRepository = jobRepositoryBuilder;
    this.filterBuilder = filterBuilder;
  }

  async execute(options: {
    page?: number;
    limit?: number;
    filter?: JobFilter;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<{ jobs: IJob[]; total: number; pages: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const filter = options.filter || {};
      const sort = options.sort || { createdAt: -1 };

      if (page < 1) {
        throw new Error('Page must be greater than 0');
      }
      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }

      const skip = (page - 1) * limit;
      const formattedFilter = this.filterBuilder.buildFilter(filter);
      const total = await this.jobRepository.count(formattedFilter);
      const pages = Math.ceil(total / limit);

      const jobs = await this.jobRepository.findAll(skip, limit, formattedFilter, sort);

      return {
        jobs,
        total,
        pages,
      };
    } catch (error) {
      console.error('Error fetching jobs list: ', error);
      throw new Error('Failed to fetch job list');
    }
  }
}
