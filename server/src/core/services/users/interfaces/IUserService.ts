import { IUser, UserRole } from "../../../../data/models/User";
import { UserData } from "../../../useCases/user/UpdateUserProfile";

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
  updateUserProfile(userId: string, userData: UserData): Promise<Omit<IUser, 'password'> | null>
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<Omit<IUser, 'password'> | null>
  updateProfilePicture(userId: string, picturePath: string): Promise<Omit<IUser, 'password'> | null>
  formatUser(user: IUser): UserResponse;
  validateCredentials(email: string, password: string): Promise<IUser | null>;
}
