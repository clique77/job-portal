import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { ICompany } from './Company';

export enum CompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member'
}

export interface IUserCompany extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  companyId: mongoose.Types.ObjectId | ICompany;
  role: CompanyRole;
  createdAt: Date;
  invitedBy?: mongoose.Types.ObjectId | IUser;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED';
}

const UserCompanySchema = new Schema<IUserCompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    role: {
      type: String,
      enum: Object.values(CompanyRole),
      default: CompanyRole.MEMBER,
      required: true
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'REJECTED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

UserCompanySchema.index({ userId: 1, companyId: 1 }, { unique: true });
UserCompanySchema.index({ userId: 1 });
UserCompanySchema.index({ companyId: 1 });
UserCompanySchema.index({ status: 1 });

const UserCompany = mongoose.model<IUserCompany>('UserCompany', UserCompanySchema);
export default UserCompany; 