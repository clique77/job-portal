import { IJob } from "../../../data/models/Jobs";
import { getJobRepository, JobCreateData, JobFilter, JobUpdateDTO } from "../../../data/repositories/jobs/JobRepository";
import UserService from "../users/UserService";
import { CreateJobUseCase } from "../../useCases/jobs/CreateJob";
import { DeleteJobUseCase } from "../../useCases/jobs/DeleteJob";
import { GetJobByIdUseCase } from "../../useCases/jobs/GetJobById";
import { ListJobsUseCase } from "../../useCases/jobs/ListJob";
import { UpdateJobUseCase } from "../../useCases/jobs/UpdateJob";
import { JobFilterBuilder } from "../../useCases/jobs/utils/JobFilterBuilder";
import { JobValidator } from "../../useCases/jobs/utils/JobValidator";
import { IJobService } from "./interfaces/JobServiceInterfaces";

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

  constructor() {
    const jobRepository = getJobRepository();
    const userService = UserService;
    const validator = new JobValidator();
    const filterBuilder = new JobFilterBuilder();

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
}

const jobService = new JobService();
export default jobService;
