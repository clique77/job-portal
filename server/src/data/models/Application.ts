import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from './ApplicationStatus';

export interface IApplication extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  resume?: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    resume: {
      type: Schema.Types.ObjectId,
      ref: 'Resume'
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
      required: true
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

ApplicationSchema.index({ user: 1, job: 1 }, { unique: true });

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application; 