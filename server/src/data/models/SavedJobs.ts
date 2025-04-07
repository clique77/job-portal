import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IJob } from './Jobs';

export interface ISavedJob extends Document {
  user: mongoose.Types.ObjectId | IUser;
  job: mongoose.Types.ObjectId | IJob;
  savedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
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
    savedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });

const SavedJob = mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);

export default SavedJob; 