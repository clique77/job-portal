import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ICompany extends Document {
  name: string;
  description: string;
  logoUrl: string;
  createdBy: mongoose.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    logoUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
  },
  {
    timestamps: true
  }
);

CompanySchema.index({ name: 'text', description: 'text', industry: 'text' });
CompanySchema.index({ createdBy: 1 });
CompanySchema.index({ location: 1 });

const Company = mongoose.model<ICompany>('Company', CompanySchema);
export default Company;