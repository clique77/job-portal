import { IUser } from '../../models/User';
import { UserMongoDBRepository } from './UserMongoDbrepository';
import { RegisterData } from '../../../core/services/auth/interfaces/AuthServiceInterfaces';
import User from '../../models/User';

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findOne(query: any): Promise<IUser | null>;
  create(data: RegisterData): Promise<IUser>;
  findAll(page: number, limit: number): Promise<IUser[]>;
  count(): Promise<number>;
  updateProfile(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  updatePassword(id: string, hashedPassword: string): Promise<IUser | null>;
  updateProfilePicture(id: string, picturePath: string): Promise<IUser | null>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findOne(query: any): Promise<IUser | null> {
    return User.findOne(query);
  }

  async create(data: RegisterData): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(page: number, limit: number): Promise<IUser[]> {
    return User.find()
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async count(): Promise<number> {
    return User.countDocuments();
  }

  async updateProfile(id: string, userData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, userData, { new: true });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true });
  }

  async updateProfilePicture(id: string, picturePath: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { profilePicture: picturePath }, { new: true });
  }
}

export const userRepository = new UserRepository();
