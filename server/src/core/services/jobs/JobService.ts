import { IJob } from "../../../data/models/Jobs";
import { getJobRepository, JobCreateData, JobFilter, JobUpdateDTO } from "../../../data/repositories/jobs/JobRepository";
import { getSavedJobRepository, ISavedJobRepository } from "../../../data/repositories/savedJobs/SavedJobRepository";
import UserService from "../users/UserService";
import { CreateJobUseCase } from "../../useCases/jobs/CreateJob";
import { DeleteJobUseCase } from "../../useCases/jobs/DeleteJob";
import { GetJobByIdUseCase } from "../../useCases/jobs/GetJobById";
import { ListJobsUseCase } from "../../useCases/jobs/ListJob";
import { UpdateJobUseCase } from "../../useCases/jobs/UpdateJob";
import { JobFilterBuilder } from "../../useCases/jobs/utils/JobFilterBuilder";
import { JobValidator } from "../../useCases/jobs/utils/JobValidator";
import { IJobService } from "./interfaces/JobServiceInterfaces";
import { MongoError } from 'mongodb';

type getAllJobsOptions ={
  page?: number;
  limit?: number;
  filter?: JobFilter;
  sort?: { [key: string]: 1 | -1 };
}

type getAllJobsParams = {
  jobs: IJob[];
  total: number;
  pages: number;
}

export class JobService implements IJobService {
  private createJobUseCase: CreateJobUseCase;
  private updateJobUseCase: UpdateJobUseCase;
  private getJobByIdUseCase: GetJobByIdUseCase;
  private listJobUseCase: ListJobsUseCase;
  private deleteJobUseCase: DeleteJobUseCase;
  private savedJobRepository: ISavedJobRepository;

  constructor() {
    const jobRepository = getJobRepository();
    const userService = UserService;
    const validator = new JobValidator();
    const filterBuilder = new JobFilterBuilder();

    this.savedJobRepository = getSavedJobRepository();
    this.createJobUseCase = new CreateJobUseCase(jobRepository, userService, validator);
    this.updateJobUseCase = new UpdateJobUseCase(jobRepository, userService, validator);
    this.getJobByIdUseCase = new GetJobByIdUseCase(jobRepository);
    this.listJobUseCase = new ListJobsUseCase(jobRepository, filterBuilder);
    this.deleteJobUseCase = new DeleteJobUseCase(jobRepository, userService);
  }

  async createJob(jobData: JobCreateData, employerId: string): Promise<IJob> {
    return this.createJobUseCase.execute(jobData, employerId);
  }

  async updateJob(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null> {
    return this.updateJobUseCase.execute(jobId, jobData, userId);
  }

  async getJobById(jobId: string): Promise<IJob | null> {
    return this.getJobByIdUseCase.execute(jobId);
  }

  async getAllJobs(options: getAllJobsOptions): Promise<getAllJobsParams> {
    return this.listJobUseCase.execute(options);
  }

  async deleteJob(jobId: string, userId: string): Promise<boolean> {
    return this.deleteJobUseCase.execute(jobId, userId);
  }

  async saveJob(userId: string, jobId: string): Promise<boolean> {
    try {
      await this.savedJobRepository.save(userId, jobId);
      return true;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        return false;
      }
      throw error;
    }
  }

  async unsaveJob(userId: string, jobId: string): Promise<boolean> {
    return this.savedJobRepository.unsave(userId, jobId);
  }

  async getSavedJobs(userId: string): Promise<IJob[]> {
    const savedJobs = await this.savedJobRepository.getSavedJobs(userId);
    return savedJobs.map(saved => saved.job as IJob);
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    return this.savedJobRepository.isSaved(userId, jobId);
  }
}

const jobService = new JobService();
export default jobService;
