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

  async findAll(skip: number, limit: number, filter?: JobFilter, sort?: { [key: string]: 1 | -1 }): Promise<IJob[]> {
    const query = this.buildQuery(filter);
    console.log("MongoDB Query:", JSON.stringify(query, null, 2));
    
    // Add logging for debugging
    if (filter && filter.company) {
      console.log(`Searching for jobs with company name: "${filter.company}"`);
    }
    
    const sortOrder = sort || { createdAt: -1 };
    console.log("Sort order:", JSON.stringify(sortOrder, null, 2));
    
    // Add case-insensitive company name search if it exists
    if (filter && filter.company) {
      query.company = { $regex: new RegExp(filter.company, 'i') };
    }
    
    const jobs = await Jobs.find(query)
      .populate('employer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort(sortOrder);
    
    console.log(`Found ${jobs.length} jobs matching the query`);
    if (jobs.length > 0) {
      console.log("Sample job:", {
        title: jobs[0].title,
        company: jobs[0].company,
        employer: jobs[0].employer
      });
    }
    
    return jobs;
  }

  async findByEmployer(employerId: string, skip: number, limit: number): Promise<IJob[]> {
    try {
    console.log(`Finding jobs for employer ID: ${employerId}`);
      
      // Debug: Find a sample job to check structure
      const sampleJob = await Jobs.findOne();
      console.log('Sample job employer field structure:', sampleJob ? {
        employerType: typeof sampleJob.employer,
        employerValue: sampleJob.employer,
        employerToString: sampleJob.employer.toString()
      } : 'No jobs found');
      
      let query: any = {};
      
      if (mongoose.Types.ObjectId.isValid(employerId)) {
        // Use $or to match both string and ObjectID versions
        query = { 
          $or: [
            { employer: employerId },
            { employer: new mongoose.Types.ObjectId(employerId) }
          ]
        };
      } else {
        // If not a valid ObjectId, just use the string version
        query = { employer: employerId };
      }
      
      const jobs = await Jobs.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
    console.log(`Found ${jobs.length} jobs for employer ${employerId}`);
      
      if (jobs.length === 0) {
        // If no jobs found, check if any jobs exist at all
        const totalJobs = await Jobs.countDocuments();
        console.log(`Total jobs in database: ${totalJobs}`);
        
        // Find all jobs and log their employer IDs for debugging
        const allJobs = await Jobs.find().limit(5);
        console.log('Sample jobs with employer details:');
        allJobs.forEach((job, index) => {
          console.log(`Job ${index + 1}:`, {
            title: job.title,
            employer: job.employer,
            employerStr: job.employer.toString(),
            company: job.company
          });
        });
      }
      
    return jobs;
    } catch (error) {
      console.error(`Error finding jobs for employer ${employerId}:`, error);
      return [];
    }
  }

  async count(filter?: JobFilter): Promise<number> {
    const query = this.buildQuery(filter);
    console.log("MongoDB Count Query:", JSON.stringify(query, null, 2));
    return Jobs.countDocuments(query);
  }

  async getUniqueLocations(): Promise<string[]> {
    try {
      const locations = await Jobs.distinct('location');
      
      return locations
        .filter(location => location && location.trim() !== '')
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error('Error getting unique locations:', error);
      return [];
    }
  }

  async getUniqueTags(): Promise<string[]> {
    try {
      const tags = await Jobs.distinct('tags');
      
      return tags
        .filter(tag => tag && tag.trim() !== '')
        .sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error('Error getting unique tags:', error);
      return [];
    }
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
    resumeId?: string;
  }): Promise<boolean> {
    console.log("Adding applicant with data:", applicationData);
    
    // Use a more flexible type for the applicationObject
    const applicationObject: Record<string, any> = {
      applicant: applicationData.applicant,
      status: applicationData.status || ApplicationStatus.PENDING,
      notes: applicationData.notes || '',
      appliedAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add resumeId to the application object if provided
    if (applicationData.resumeId) {
      console.log(`Adding resume ID to application: ${applicationData.resumeId}`);
      applicationObject.resumeId = applicationData.resumeId;
    }

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
      const isSimpleIds = typeof firstApplicant === 'string' || (firstApplicant && typeof firstApplicant !== 'object');

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

      return result !== null;
    } catch (error) {
      console.error(`Error removing applicant ${applicantId} from job ${jobId}:`, error);
      return false;
    }
  }

  async getApplicants(jobId: string): Promise<IApplication[]> {
    try {
      console.log(`Getting applicants for job ${jobId}`);
      
      const job = await Jobs.findById(jobId)
        .populate({
          path: 'applicants.applicant',
          select: 'name email'
        })
        .populate({
          path: 'applicants.resumeId',
          select: 'fileName filePath fileType fileSize'
        });

      if (!job) {
        console.log('Job not found');
        return [];
      }

      if (!job.applicants || job.applicants.length === 0) {
        console.log('No applicants found for this job');
        return [];
      }
      
      console.log(`Found ${job.applicants.length} applicants for job ${jobId}`);
      
      // Debug: Log resume information for each applicant
      console.log('Resume debug information:');
      job.applicants.forEach((app, index) => {
        const resumeInfo = app.resumeId 
          ? { 
              id: app.resumeId._id || app.resumeId,
              fileName: (app.resumeId as any).fileName || 'Unknown' 
            }
          : 'No resume';
        
        console.log(`Applicant ${index + 1}: ${(app.applicant as any).name || app.applicant}`, {
          hasResume: !!app.resumeId,
          resumeInfo
        });
      });

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

  async getMaxSalary(): Promise<number> {
    try {
      const result = await Jobs.aggregate([
        { $match: { 'salary.max': { $exists: true, $ne: null } } },
        { $group: { _id: null, maxSalary: { $max: '$salary.max' } } }
      ]);
      return result.length > 0 ? result[0].maxSalary : 0;
    } catch (error) {
      console.error('Error getting max salary:', error);
      return 0;
    }
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

      if (filter.salary.currency) {
        query['salary.currency'] = filter.salary.currency;
      }
    }

    if (filter.employer) {
      console.log(`Adding employer filter for: ${filter.employer}`);
      // Handle both string and ObjectId formats
      if (mongoose.Types.ObjectId.isValid(filter.employer)) {
        if (!query.$or) query.$or = [];
        query.$or.push({ employer: filter.employer });
        query.$or.push({ employer: new mongoose.Types.ObjectId(filter.employer) });
      } else {
      query.employer = filter.employer;
      }
    }

    if (filter.company) {
      console.log(`Adding company name filter for: ${filter.company}`);
      // Using case-insensitive regex for company name matching
      query.company = { $regex: new RegExp(filter.company.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i') };
    }

    if (filter._companyId) {
      console.log(`Adding company ID filter for: ${filter._companyId}`);
      // For special case with _companyId, we need to check if there are any companies associated with this ID
      // and then get the names of those companies to search by name
      // This would require querying the Company collection first
      
      // For now, we can directly try to match against the employer field as this might be the company ID
      if (mongoose.Types.ObjectId.isValid(filter._companyId)) {
        if (!query.$or) query.$or = [];
        
        // Try matching against employer field directly (might be storing company ID)
        query.$or.push({ employer: filter._companyId });
        query.$or.push({ employer: new mongoose.Types.ObjectId(filter._companyId) });
        
        // If we have a company field as string, we could also try a direct match there
        query.$or.push({ company: filter._companyId });
      }
    }

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.tags) {
      query.tags = { $in: filter.tags };
    }

    console.log("Built query:", JSON.stringify(query, null, 2));
    return query;
  }
}

export default JobMongoDBRepository;
