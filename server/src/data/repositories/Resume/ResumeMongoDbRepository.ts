import { IResumeRepository } from "./ResumeRepository";
import Resume, { IResume } from "../../models/Resume";
import { FilterQuery } from "mongoose";

class ResumeMongoDbRepository implements IResumeRepository<IResume> {
  async create(data: Partial<IResume>): Promise<IResume> {
    const resume = new Resume(data);
    return await resume.save();
  }

  async findById(id: string): Promise<IResume | null> {
    return await Resume.findById(id);
  }

  async findByJobSeekerId(jobSeekerId: string, skip: number = 0, limit: number = 10): Promise<IResume[]> {
    return await Resume.find({ jobSeekerId, isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async delete(id: string): Promise<boolean> {
    const result = await Resume.findByIdAndUpdate(id, { isActive: false });
    return !!result;
  }

  async count(filter?: FilterQuery<IResume>): Promise<number> {
    const defaultFilter: FilterQuery<IResume> = { isActive: true };
    const finalFilter = filter ? { ...defaultFilter, ...filter } : defaultFilter;
    return await Resume.countDocuments(finalFilter);
  }
}

let resumeRepository: ResumeMongoDbRepository | null = null;

export const getResumeRepository = (): ResumeMongoDbRepository => {
  if (!resumeRepository) {
    resumeRepository = new ResumeMongoDbRepository();
  }
  return resumeRepository;
};

export default ResumeMongoDbRepository;