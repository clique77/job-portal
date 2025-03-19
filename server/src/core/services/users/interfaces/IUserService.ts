import { IUser, UserRole } from "../../../../data/models/User";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UsersListResponse {
  users: UserResponse[];
  total: number;
}

export interface IUserService {
  getUserById(userId: string): Promise<Omit<IUser, 'password'> | null>;
  getAllUsers(page?: number, limit?: number): Promise<{ users: Omit<IUser, 'password'>[],total: number }>
  formatUser(user: IUser): UserResponse;
  validateCredentials(email: string, password: string): Promise<IUser | null>;
}
