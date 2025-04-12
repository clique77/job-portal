import { IResume } from "../../../../data/models/Resume";

export interface IResumeService {
  createResume(data: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }, userId: string): Promise<IResume>;
  getResumeById(resumeId: string, userId: string): Promise<IResume | null>;
  getUserResumes(userId: string, page?: number, limit?: number): Promise<{
    resumes: IResume[];
    total: number;
    pages: number;
  }>;
  deleteResume(resumeId: string, userId: string): Promise<boolean>;
}