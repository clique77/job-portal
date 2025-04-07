import SavedJob, { ISavedJob } from '../../models/SavedJobs';
import { Types } from 'mongoose';

export interface ISavedJobRepository {
  save(userId: string, jobId: string): Promise<ISavedJob>;
  unsave(userId: string, jobId: string): Promise<boolean>;
  getSavedJobs(userId: string): Promise<ISavedJob[]>;
  isSaved(userId: string, jobId: string): Promise<boolean>;
}

class SavedJobRepository implements ISavedJobRepository {
  async save(userId: string, jobId: string): Promise<ISavedJob> {
    return SavedJob.create({
      user: new Types.ObjectId(userId),
      job: new Types.ObjectId(jobId)
    });
  }

  async unsave(userId: string, jobId: string): Promise<boolean> {
    const result = await SavedJob.deleteOne({
      user: new Types.ObjectId(userId),
      job: new Types.ObjectId(jobId)
    });
    return result.deletedCount > 0;
  }

  async getSavedJobs(userId: string): Promise<ISavedJob[]> {
    return SavedJob.find({
      user: new Types.ObjectId(userId)
    })
    .populate('job')
    .sort({ savedAt: -1 });
  }

  async isSaved(userId: string, jobId: string): Promise<boolean> {
    const savedJob = await SavedJob.findOne({
      user: new Types.ObjectId(userId),
      job: new Types.ObjectId(jobId)
    });
    return !!savedJob;
  }
}

export const getSavedJobRepository = (): ISavedJobRepository => {
  return new SavedJobRepository();
}; 