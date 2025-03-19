import { ApplicationStatus, validStatusTransitions } from "../../../data/models/ApplicationStatus";
import { UserRole } from "../../../data/models/User";
import { IJobRepository } from "../../../data/repositories/jobs/JobRepository";
import { UserService } from "../../services/users/UserService";
import { IUpdateApplicationStatusUseCase } from "./interfaces/IApplicationUseCase";
import { IUserService } from "../../services/users/interfaces/IUserService";

export class UpdateApplicationStatus implements IUpdateApplicationStatusUseCase {
  constructor(
    private jobRepository: IJobRepository,
    private userService: IUserService
  ) {}

  async execute(jobId: string, applicantId: string, status: ApplicationStatus, userId: string, notes?: string): Promise<boolean> {
    try {
      const job = await this.jobRepository.findById(jobId);

      if (!job) {
        throw new Error("Job not found");
      }

      console.log("Job employer:", job.employer);
      console.log("User ID:", userId);

      const employerId = typeof job.employer === 'object' && job.employer._id ?
        job.employer._id.toString() :
        job.employer.toString();

      console.log("Extracted employer ID:", employerId);
      console.log("Do they match?", employerId === userId);

      if (employerId !== userId) {
        throw new Error("You are not authorized to update this application");
      }

      let applicantFound = false;
      if (job.applicants && Array.isArray(job.applicants)) {
        if (job.applicants.length > 0) {
          const firstApplicant = job.applicants[0];

          if (typeof firstApplicant === 'string') {
            applicantFound = job.applicants.some((appId: any) =>
              appId.toString() === applicantId.toString()
            );
          } else {
            applicantFound = job.applicants.some((app: any) => {
              if (typeof app === 'object' && app.applicant) {
                const appId = typeof app.applicant === 'object' ?
                  app.applicant._id.toString() :
                  app.applicant.toString();
                return appId === applicantId;
              }
              return false;
            });
          }
        }
      }

      if (!applicantFound) {
        throw new Error("Applicant not found for this job");
      }

      return this.jobRepository.updateApplicationStatus(jobId, applicantId, status, notes);
    } catch (error) {
      throw error;
    }
  }
}
