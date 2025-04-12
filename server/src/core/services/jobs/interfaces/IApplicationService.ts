import { ApplicationStatus } from "../../../../data/models/ApplicationStatus";
import { IApplication, IJob } from "../../../../data/models/Jobs";

export interface IApplicationService {
  applyToJob(jobId: string, userId: string, notes?: string, resumeId?: string): Promise<boolean>;
  withdrawApplication(jobId: string, userId: string): Promise<boolean>;
  getUserApplications(userId: string, page?: number, limit?: number): Promise<{
    applications: Array<{job: IJob, application: IApplication}>,
    total: number,
    pages: number
  }>;
  getJobApplicants(jobId: string, userId: string): Promise<IApplication[]>;
  updateApplicationStatus(
    jobId: string,
    applicantId: string,
    status: ApplicationStatus,
    userId: string,
    notes?: string
  ): Promise<boolean>;
}
