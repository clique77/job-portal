import { IJob } from "../../../data/models/Jobs";
import { IJobRepository, JobCreateData } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";
import { ICreateJobUseCase } from "./interfaces/IJobUseCase";
import { JobValidator } from "./utils/JobValidator";

export class CreateJobUseCase implements ICreateJobUseCase {
  private jobRepository: IJobRepository;
  private userService: UserService;
  private validator: JobValidator;

  constructor (jobRepository: IJobRepository, userService: UserService, validator: JobValidator) {
    this.jobRepository = jobRepository;
    this.userService = userService;
    this.validator = validator;
  }

  async execute(jobData: JobCreateData, employerId: string): Promise<IJob> {
    try {
      const user = await this.userService.getUserById(employerId);

      if (!user) {
        throw new Error('Employer not found');
      }

      if (user.role !== 'employer' && user.role !== 'admin') {
        throw new Error('Only employer or admin can create jobs');
      }

      this.validator.validateJobData(jobData);

      const jobToCreate: JobCreateData = {
        ...jobData,
        employer: employerId,
        status: 'ACTIVE',
        createdAt: new Date(),
        applicants: [],
      }
      const createdJob = await this.jobRepository.create(jobToCreate);

      return createdJob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create a job: ${errorMessage}`);
    }
  }
}
