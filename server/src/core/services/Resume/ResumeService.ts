import { IResume } from "../../../data/models/Resume";;
import { getResumeRepository } from "../../../data/repositories/Resume/ResumeMongoDbRepository";
import UserService from "../users/UserService";
import { CreateResume } from "../../useCases/Resume/CreateResume";
import { GetResumeById } from "../../useCases/Resume/GetResumeById";
import { GetUserResumes } from "../../useCases/Resume/GetUserResumes";
import { DeleteResume } from "../../useCases/Resume/DeleteResume";
import { IResumeService } from "./interfaces/IResumeService";
import { IApplication } from "../../../data/models/Jobs";
import { UserRole } from "../../../data/models/User";

export class ResumeService implements IResumeService {
  private createResumeUseCase: CreateResume;
  private getResumeByIdUseCase: GetResumeById;
  private getUserResumesUseCase: GetUserResumes;
  private deleteResumeUseCase: DeleteResume;
  private resumeRepository = getResumeRepository();

  constructor() {
    const userService = UserService;

    this.createResumeUseCase = new CreateResume(this.resumeRepository, userService);
    this.getResumeByIdUseCase = new GetResumeById(this.resumeRepository, userService);
    this.getUserResumesUseCase = new GetUserResumes(this.resumeRepository, userService);
    this.deleteResumeUseCase = new DeleteResume(this.resumeRepository, userService);
  }

  async createResume(data: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }, userId: string): Promise<IResume> {
    return this.createResumeUseCase.execute(data, userId);
  }

  async getResumeById(resumeId: string, userId: string): Promise<IResume | null> {
    try {
      console.log(`ResumeService: Getting resume ${resumeId} for user ${userId}`);
      
      // First check if this is the owner of the resume
      const resume = await this.resumeRepository.findById(resumeId);
      
      if (!resume) {
        console.log(`Resume ${resumeId} not found`);
        return null;
      }
      
      const isOwner = resume.jobSeekerId.toString() === userId;
      console.log(`Resume owner check: ${isOwner ? 'User is owner' : 'User is not owner'}`);
      
      if (isOwner) {
        return resume;
      }
      
      // If not the owner, check if this user is an employer or admin
      // They should be able to view resumes of applicants to their jobs
      const userService = require('../users/UserService').default;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        console.log(`User ${userId} not found`);
        return null;
      }
      
      console.log(`User detected with role: '${user.role}'`);
      const isEmployerOrAdmin = user.role === UserRole.EMPLOYER || user.role === UserRole.ADMIN;
      console.log(`User role check: ${isEmployerOrAdmin ? 'User is employer/admin' : 'User is not employer/admin'}`);
      
      if (isEmployerOrAdmin) {
        // Employers and admins can view all resumes
        // For simplicity, allow all employers to view any resume
        console.log(`Allowing employer/admin with role '${user.role}' to view resume ${resumeId}`);
        return resume;
      }
      
      console.log('Access denied: User is neither the owner nor an employer/admin');
      return null;
    } catch (error) {
      console.error(`Error in getResumeById for ${resumeId}:`, error);
      throw error;
    }
  }

  async getUserResumes(userId: string, page: number = 1, limit: number = 10): Promise<{
    resumes: IResume[];
    total: number;
    pages: number;
  }> {
    return this.getUserResumesUseCase.execute(userId, page, limit);
  }

  async deleteResume(resumeId: string, userId: string): Promise<boolean> {
    return this.deleteResumeUseCase.execute(resumeId, userId);
  }
}

export default new ResumeService();