import { IUser } from '../../models/User';
import { UserMongoDBRepository } from './UserMongoDbrepository';

export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(user: UserCreateData): Promise<IUser>;
  findAll(page: number, limit: number): Promise<IUser[]>;
  count(): Promise<number>;
  updateProfile(id: string, userData: Partial<IUser>): Promise<IUser | null>;
  updatePassword(id: string, hashedPassword: string): Promise<IUser | null>;
  updateProfilePicture(id: string, picturePath: string): Promise<IUser | null>;
}

export const userRepository: IUserRepository = new UserMongoDBRepository();
