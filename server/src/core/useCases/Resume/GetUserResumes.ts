import { IResume } from "../../../data/models/Resume";
import { IResumeRepository } from "../../../data/repositories/Resume/ResumeRepository";
import { UserService } from "../../services/users/UserService";
import { IGetUserResumesUseCase } from "./interfaces/IResumeUseCase";

export class GetUserResumes implements IGetUserResumesUseCase {
  private resumeRepository: IResumeRepository<IResume>;
  private userService: UserService;

  constructor(resumeRepository: IResumeRepository<IResume>, userService: UserService) {
    this.resumeRepository = resumeRepository;
    this.userService = userService;
  }

  async execute(userId: string, page: number, limit: number): Promise<{
    resumes: IResume[];
    total: number;
    pages: number;
  }> {
    try {
      const user = await this.userService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      const skip = (page - 1) * limit;
      const resumes = await this.resumeRepository.findByJobSeekerId(userId, skip, limit);
      const total = await this.resumeRepository.count({ jobSeekerId: userId, isActive: true});
      const pages = Math.ceil(total / limit);

      return {
        resumes,
        total,
        pages
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get user resumes: ${errorMessage}`);
    }
  }
}