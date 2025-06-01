import { FastifyRequest, FastifyReply } from 'fastify';
import { IResumeService } from '../../../core/services/Resume/interfaces/IResumeService';
import { IErrorHandlerService } from '../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces';
import { IPaginationService } from '../../../core/services/common/pagination/interfaces/PaginationServiceInterfaces';
import config from '../../../config';
import { createWriteStream } from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';

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

      if (data.file.bytesRead > config.uploads.maxSize) {
        return reply.status(400).send({ 
          message: `File size exceeds maximum limit of ${config.uploads.maxSize / 1024 / 1024}MB` 
        });
      }

      // @ts-ignore
      const userId = request.user.id;

      // Save to local disk
      const uploadDir = config.uploads.directory;
      await mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${data.filename}`;
      const filePath = path.join(uploadDir, filename);

      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(filePath);
        data.file.pipe(writeStream);
        data.file.on('end', resolve);
        data.file.on('error', reject);
      });

      const fileUrl = `/uploads/${data.filename}`;

      const resumeData = {
        fileName: filename,
        filePath: fileUrl,
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

      console.log(`Get resume request for ID: ${id} from user: ${userId}`);

      const resume = await this.resumeService.getResumeById(id, userId);

      if (!resume) {
        console.log(`Resume not found for ID: ${id}`);
        return reply.status(404).send({ message: 'Resume not found' });
      }

      console.log('Successfully retrieved resume:', {
        id: resume._id,
        fileName: resume.fileName,
        fileSize: resume.fileSize,
        jobSeekerId: resume.jobSeekerId
      });

      return reply.send({ resume });
    } catch (error) {
      console.error(`Error getting resume ${request.params.id}:`, error);
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