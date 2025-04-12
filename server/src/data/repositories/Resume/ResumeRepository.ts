import { IResume } from "../../models/Resume";
import { FilterQuery } from "mongoose";
import ResumeMongoDbRepository from "./ResumeMongoDbRepository";

export interface IResumeRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findByJobSeekerId(jobSeekerId: string, skip?: number, limit?: number): Promise<T[]>;
  delete(id: string): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
}

export const resumeRepository: IResumeRepository<IResume> = new ResumeMongoDbRepository();