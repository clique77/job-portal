import { IApplication, IJob } from "../../../data/models/Jobs";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { IGetUserApplicationsUseCase } from "./interfaces/IApplicationUseCase";

export class GetUserApplications implements IGetUserApplicationsUseCase {
  private jobRepository: IJobRepository;

  constructor(jobRepository: IJobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(userId: string, page: number = 1, limit: number = 10): Promise<{
    applications: Array<{job: IJob, application: IApplication}>,
    total: number,
    pages: number
  }> {
    try {
      const skip = (page - 1) * limit;

      const jobs = await this.jobRepository.findJobsByApplicant(userId, skip, limit);

      const applications = jobs.map(job => {
        const userApplication = job.applicants.find(app => app.applicant.toString() === userId);

        return {
          job,
          application: userApplication as IApplication
        };
      });

      const total = await this.jobRepository.count({ applicantId: userId });
      const pages = Math.ceil(total / limit);

      return {
        applications,
        total,
        pages
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get user applications: ${errorMessage}`);
    }
  }
}
