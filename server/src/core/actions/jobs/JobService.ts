import { IJob } from "../../../data/models/Jobs";
import { getJobRepository, JobCreateData, JobFilter, JobUpdateDTO } from "../../../data/repositories/jobs/JobRepository";
import UserService from "../../user/UserService";
import { CreateJobAction } from "./CreateJobAction";
import { DeleteJobAction } from "./DeleteJobAction";
import { GetJobByIdAction } from "./GetJobByIdAction";
import { ListJobsAction } from "./ListJobAction";
import { UpdateJobAction } from "./UpdateJobAction";
import { JobFilterBuilder } from "./utils/JobFilterBuilder";
import { JobValidator } from "./utils/JobValidator";

export class JobService {
  private createJobAction: CreateJobAction;
  private updateJobAction: UpdateJobAction;
  private getJobByIdAction: GetJobByIdAction;
  private listJobAction: ListJobsAction;
  private deleteJobAction: DeleteJobAction;

  constructor() {
    const jobRepository = getJobRepository();
    const userService = UserService;
    const validator = new JobValidator();
    const filterBuilder = new JobFilterBuilder();

    this.createJobAction = new CreateJobAction(jobRepository, userService, validator);
    this.updateJobAction = new UpdateJobAction(jobRepository, userService, validator);
    this.getJobByIdAction = new GetJobByIdAction(jobRepository);
    this.listJobAction = new ListJobsAction(jobRepository, filterBuilder);
    this.deleteJobAction = new DeleteJobAction(jobRepository, userService);
  }

  async createJob(jobData: JobCreateData, employerId: string): Promise<IJob> {
    return this.createJobAction.execute(jobData, employerId);
  }

  async updateJob(jobId: string, jobData: JobUpdateDTO, userId: string): Promise<IJob | null> {
    return this.updateJobAction.execute(jobId, jobData, userId);
  }

  async getJobById(jobId: string): Promise<IJob | null> {
    return this.getJobByIdAction.execute(jobId);
  }

  async getAllJobs(options: { page?: number, limit?: number, filter?: JobFilter, sort?: { [key: string]: 1 | -1 }}): Promise<{ jobs: IJob[], total: number, pages: number }> {
    return this.listJobAction.execute(options);
  }

  async deleteJob(jobId: string, userId: string): Promise<boolean> {
    return this.deleteJobAction.execute(jobId, userId);
  }
}

