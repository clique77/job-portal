import { IUser } from '../models/User';

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
}
