import { FastifyRequest, FastifyReply } from 'fastify';
import { IResumeService } from '../../../core/services/Resume/interfaces/IResumeService';
import { IErrorHandlerService } from '../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces';
import { IPaginationService } from '../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces';
import { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

interface CreateResumeBody {
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

class ResumeController {
  private resumeService: IResumeService;
  private errorHandlerService: IErrorHandlerService;
  private paginationService: IPaginationService;

  constructor(
    resumeService: IResumeService,
    errorHandlerService: IErrorHandlerService,
    paginationService: IPaginationService
  ) {
    this.resumeService = resumeService;
    this.errorHandlerService = errorHandlerService;
    this.paginationService = paginationService;

    this.createResume = this.createResume.bind(this);
    this.getResumeById = this.getResumeById.bind(this);
    this.getUserResumes = this.getUserResumes.bind(this);
    this.deleteResume = this.deleteResume.bind(this);
  }

  async createResume(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();
      
      if (!data) {
        return reply.status(400).send({ message: 'No file uploaded' });
      }

      if (data.mimetype !== 'application/pdf') {
        return reply.status(400).send({ message: 'Only PDF files are allowed' });
      }

      // @ts-ignore
      const userId = request.user.id;
      
      const uploadsDir = path.join(process.cwd(), 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const fileName = `${Date.now()}-${data.filename}`;
      const filePath = path.join(uploadsDir, fileName);

      await pipeline(data.file, createWriteStream(filePath));

      const resumeData = {
        fileName: data.filename,
        filePath: fileName,
        fileType: data.mimetype,
        fileSize: data.file.bytesRead
      };

      const resume = await this.resumeService.createResume(resumeData, userId);

      return reply.status(201).send({ 
        message: "Resume uploaded successfully", 
        resume 
      });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getResumeById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const resume = await this.resumeService.getResumeById(id, userId);

      if (!resume) {
        return reply.status(404).send({ message: 'Resume not found' });
      }

      return reply.send({ resume });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async getUserResumes(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;
      const { page, limit } = this.paginationService.getPaginationParams(request);

      const result = await this.resumeService.getUserResumes(userId, page, limit);

      return this.paginationService.createPaginationResult(
        result.resumes,
        result.total,
        page,
        limit
      );
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async deleteResume(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      //@ts-ignore
      const userId = request.user.id;

      const result = await this.resumeService.deleteResume(id, userId);

      if (!result) {
        return reply.status(404).send({ message: 'Resume not found' });
      }

      return reply.send({ message: 'Resume deleted successfully' });
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }
}

import resumeService from '../../../core/services/Resume/ResumeService';
import errorHandlerService from '../../../core/services/common/error-handler/ErrorHandlerService';
import paginationService from '../../../core/services/common/pagination/PaginationService';

export const resumeController = new ResumeController(
  resumeService,
  errorHandlerService,
  paginationService
);