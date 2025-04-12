import { IResume } from "../../../data/models/Resume";;
import { getResumeRepository } from "../../../data/repositories/Resume/ResumeMongoDbRepository";
import UserService from "../users/UserService";
import { CreateResume } from "../../useCases/Resume/CreateResume";
import { GetResumeById } from "../../useCases/Resume/GetResumeById";
import { GetUserResumes } from "../../useCases/Resume/GetUserResumes";
import { DeleteResume } from "../../useCases/Resume/DeleteResume";
import { IResumeService } from "./interfaces/IResumeService";

export class ResumeService implements IResumeService {
  private createResumeUseCase: CreateResume;
  private getResumeByIdUseCase: GetResumeById;
  private getUserResumesUseCase: GetUserResumes;
  private deleteResumeUseCase: DeleteResume;

  constructor() {
    const resumeRepository = getResumeRepository();
    const userService = UserService;

    this.createResumeUseCase = new CreateResume(resumeRepository, userService);
    this.getResumeByIdUseCase = new GetResumeById(resumeRepository, userService);
    this.getUserResumesUseCase = new GetUserResumes(resumeRepository, userService);
    this.deleteResumeUseCase = new DeleteResume(resumeRepository, userService);
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
    return this.getResumeByIdUseCase.execute(resumeId, userId);
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