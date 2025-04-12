import { IResume } from "../../../data/models/Resume";
import { UserRole } from "../../../data/models/User";
import { IResumeRepository } from "../../../data/repositories/Resume/ResumeRepository";
import { UserService } from "../../services/users/UserService";
import { IGetResumeByIdUseCase } from "./interfaces/IResumeUseCase";

export class GetResumeById implements IGetResumeByIdUseCase {
  private resumeRepository: IResumeRepository<IResume>;
  private userService: UserService;

  constructor(resumeRepository: IResumeRepository<IResume>, userService: UserService) {
    this.resumeRepository = resumeRepository;
    this.userService = userService;
  }

  async execute(resumeId: string, userId: string): Promise<IResume | null> {
    try {
      const resume = await this.resumeRepository.findById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }
  
      const user = await this.userService.getUserById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      const isAdmin = user.role === UserRole.ADMIN;
      const isOwner = resume.jobSeekerId.toString() === userId;
  
      if (!isAdmin && !isOwner) {
        throw new Error('You are not authorized to access this resume');
      }
  
      return resume;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get resume: ${errorMessage}`);
    }
  }
}