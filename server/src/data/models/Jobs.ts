import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  REMOTE = 'REMOTE',
  INTERNSHIP = 'INTERNSHIP'
}

export interface IJob extends Document {
  title: string;
  description: string;
  requirements: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: JobType;
  category: string;
  tags: string[];
  employer: mongoose.Types.ObjectId | IUser;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    type: {
      type: String,
      enum: Object.values(JobType),
      required: true
    },
    category: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED', 'DRAFT'],
      default: 'ACTIVE'
    },
    applicants: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

JobSchema.index({ title: 'text', description: 'text', company: 'text', location: 'text' });
JobSchema.index({ category: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ employer: 1 });
JobSchema.index({ createdAt: -1 });

const Job = mongoose.model<IJob>('Job', JobSchema);

export default Job;
