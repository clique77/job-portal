import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IResume extends Document {
  jobSeekerId: mongoose.Types.ObjectId | IUser;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  isActive: boolean;
}

const ResumeSchema = new Schema<IResume>(
  {
    jobSeekerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ResumeSchema.index({ jobSeekerId: 1 });
ResumeSchema.index({ isActive: 1 });

const Resume = mongoose.model<IResume>('Resume', ResumeSchema);

export default Resume;
