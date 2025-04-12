import { IResume } from "../../../../data/models/Resume";

export interface ICreateResumeUseCase {
  execute(data: {
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }, userId: string): Promise<IResume>;
}

export interface IGetResumeByIdUseCase {
  execute(resumeId: string, userId: string): Promise<IResume | null>;
}

export interface IGetUserResumesUseCase {
  execute(userId: string, page?: number, limit?: number): Promise<{
    resumes: IResume[];
    total: number;
    pages: number;
  }>;
}

export interface IDeleteResumeUseCase {
  execute(resumeId: string, userId: string): Promise<boolean>;
}