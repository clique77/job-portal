import Jobs, { IApplication } from "../../models/Jobs";
import { IJobRepository, JobCreateData, JobUpdateData, JobFilter } from "./JobRepository";
import { IJob } from "../../models/Jobs";
import mongoose from "mongoose";
import { ApplicationStatus } from "../../models/ApplicationStatus";

export class JobMongoDBRepository implements IJobRepository {
  async create(jobData: JobCreateData): Promise<IJob> {
    const job = new Jobs(jobData);
    return job.save();
  }

  async findById(id: string): Promise<IJob | null> {
    return Jobs.findById(id).populate('employer', 'name email');
  }

  async update(id: string, jobData: JobUpdateData): Promise<IJob | null> {
    return Jobs.findByIdAndUpdate(id, jobData, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Jobs.findByIdAndDelete(id);
    return result !== null;
  }

  async findAll(skip: number, limit: number, filter?: JobFilter): Promise<IJob[]> {
    const query = this.buildQuery(filter);
    return Jobs.find(query).populate('employer', 'name email').skip(skip).limit(limit).sort({ createdAt: -1 });
  }

  async findByEmployer(employerId: string, skip: number, limit: number): Promise<IJob[]> {
    return Jobs.find({ employer: employerId }).skip(skip).limit(limit).sort({ createdAt: -1 });
  }

  async count(filter?: JobFilter): Promise<number> {
    const query = this.buildQuery(filter);
    return Jobs.countDocuments(query);
  }

  async search(query: string, skip: number, limit: number): Promise<IJob[]> {
    const jobs = await Jobs.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' }}
    )
    .sort({ score: { $meta: 'textScore' }})
    .skip(skip)
    .limit(limit);

    return jobs;
  }

  async addApplicant(jobId: string, applicationData: {
    applicant: string;
    status?: ApplicationStatus;
    notes?: string;
  }): Promise<boolean> {
    const applicationObject = {
      applicant: applicationData.applicant,
      status: applicationData.status || ApplicationStatus.PENDING,
      notes: applicationData.notes || '',
      appliedAt: new Date(),
      updatedAt: new Date()
    };

    const result = await Jobs.findByIdAndUpdate(
      jobId,
      { $push: { applicants: applicationObject } },
      { new: true }
    );

    return result !== null;
  }

  async removeApplicant(jobId: string, applicantId: string): Promise<boolean> {
    try {
      const job = await Jobs.findById(jobId);

      if (!job || !job.applicants || job.applicants.length === 0) {
        return false;
      }

      const firstApplicant = job.applicants[0];
      const isSimpleIds = typeof firstApplicant === 'string' ||
                          (firstApplicant && typeof firstApplicant !== 'object');

      let result;

      if (isSimpleIds) {
        result = await Jobs.findByIdAndUpdate(
          jobId,
          { $pull: { applicants: applicantId } },
          { new: true }
        );
      } else {
        result = await Jobs.findByIdAndUpdate(
          jobId,
          { $pull: { applicants: { applicant: applicantId } } },
          { new: true }
        );

        if (!result || result.applicants.some(app =>
            typeof app === 'object' && app.applicant &&
            app.applicant._id.toString() === applicantId)) {
          result = await Jobs.findByIdAndUpdate(
            jobId,
            { $pull: { applicants: { 'applicant._id': applicantId } } },
            { new: true }
          );
        }
      }

      console.log(`Removed applicant ${applicantId} from job ${jobId}. Success: ${result !== null}`);
      return result !== null;
    } catch (error) {
      console.error(`Error removing applicant ${applicantId} from job ${jobId}:`, error);
      return false;
    }
  }

  async getApplicants(jobId: string): Promise<IApplication[]> {
    try {
      const job = await Jobs.findById(jobId)
        .populate({
          path: 'applicants.applicant',
          select: 'name email'
        });

      if (!job) return [];

      if (!job.applicants || job.applicants.length === 0) {
        return [];
      }

      const firstApplicant = job.applicants[0];

      if (typeof firstApplicant === 'string' ||
          (firstApplicant && typeof firstApplicant !== 'object')) {
        const formattedApplicants: IApplication[] = await Promise.all(
          job.applicants.map(async (applicantId: any) => {
            const user = await mongoose.model('User').findById(applicantId);
            const now = new Date();
            return {
              applicant: user || { _id: applicantId },
              status: 'PENDING',
              notes: '',
              appliedAt: now,
              updatedAt: now,
            } as IApplication;
          })
        );

        return formattedApplicants;
      }
      return job.applicants;
    } catch (error) {
      console.error('Error getting applicants:', error);
      return [];
    }
  }

  async getApplication(jobId: string, applicantId: string): Promise<IApplication | null> {
    const job = await Jobs.findById(jobId);

    if (!job) {
      return null;
    }

    const application = job.applicants.find(
      app => app.applicant.toString() === applicantId
    );

    return application || null;
  }

  async updateApplicationStatus(
    jobId: string,
    applicantId: string,
    newStatus: ApplicationStatus,
    notes?: string
  ): Promise<boolean> {
    const updateData: any = {
      'applicants.$.status': newStatus,
      'applicants.$.updatedAt': new Date()
    };

    if (notes) {
      updateData['applicants.$.notes'] = notes;
    }

    const result = await Jobs.findOneAndUpdate(
      {
        _id: jobId,
        'applicants.applicant': applicantId
      },
      {
        $set: updateData
      },
      { new: true }
    );

    return result !== null;
  }

  async findJobsByApplicant(
    applicantId: string,
    skip: number = 0,
    limit: number = 10
  ): Promise<IJob[]> {
    const jobs = await Jobs.find(
      { 'applicants.applicant': applicantId }
    )
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

    return jobs;
  }

  private buildQuery(filter?: JobFilter): any {
    const query: any = {};

    if (!filter) return {};

    if (filter.title) {
      query.title = { $regex: filter.title, $options: 'i'};
    }

    if (filter.category) {
      query.category = filter.category;
    }

    if (filter.location) {
      query.location = filter.location;
    }

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.salary) {
      if (filter.salary.min) {
        query['salary.min'] = { $gte: filter.salary.min };
      }

      if (filter.salary.max) {
        query['salary.max'] = { $lte: filter.salary.max };
      }
    }

    if (filter.employer) {
      query.employer = filter.employer;
    }

    if (filter.status) {
      query.status = filter.status
    }

    if (filter.tags) {
      query.tags = { $in: filter.tags };
    }

    return query;
  }
}

export default JobMongoDBRepository;
