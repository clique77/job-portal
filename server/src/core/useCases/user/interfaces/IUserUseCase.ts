import { IUser } from "../../../../data/models/User";
import { UserResponse } from '../../../services/users/interfaces/IUserService';

export interface IGetUserByIdUseCase {
  execute(userId: string): Promise<Omit<IUser, 'password'> | null>;
}

export interface IGetAllUsersUseCase {
  execute(page?: number, limit?: number): Promise<{
    users: Omit<IUser, 'password'>[],
    total: number
  }>;
}

export interface IValidateCredentialsUseCase {
  execute(email: string, password: string): Promise<IUser | null>;
}

export interface IFormatUserUseCase {
  execute(user: IUser): UserResponse;
}

export interface ICreateUserUseCase {
  execute(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<IUser>;
}

export interface IUpdateUserProfileUseCase {
  execute(id: string, userData: Partial<IUser>): Promise<Omit<IUser, 'password'> | null>;
}

export interface IUpdatePasswordUseCase {
  execute(id: string, currentPassword: string, newPassword: string): Promise<Omit<IUser, 'password'> | null>;
}

export interface IUpdateProfilePictureUseCase {
  execute(id: string, picturePath: string): Promise<Omit<IUser, 'password'> | null>;
}