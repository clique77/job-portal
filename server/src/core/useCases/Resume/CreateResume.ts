import mongoose from "mongoose";
import { IResume } from "../../../data/models/Resume";
import { UserRole } from "../../../data/models/User";
import { IResumeRepository } from "../../../data/repositories/Resume/ResumeRepository";
import { UserService } from "../../services/users/UserService";
import { ICreateResumeUseCase } from "./interfaces/IResumeUseCase";

export class CreateResume implements ICreateResumeUseCase {
  private resumeRepository: IResumeRepository<IResume>;
  private userService: UserService;

  constructor(resumeRepository: IResumeRepository<IResume>, userService: UserService) {
    this.resumeRepository = resumeRepository;
    this.userService = userService;
  }

  async execute(data: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }, userId: string): Promise<IResume> {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const isJobSeeker = user.role === UserRole.JOB_SEEKER

      if (!isJobSeeker) {
        throw new Error('Only job seeker can upload resume');
      }

      const resumeData = await this.resumeRepository.create({
        ...data,
        jobSeekerId: new mongoose.Types.ObjectId(userId),
        isActive: true,
        uploadedAt: new Date()
      });

      return resumeData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create resume: ${errorMessage}`);
    }
  }
}