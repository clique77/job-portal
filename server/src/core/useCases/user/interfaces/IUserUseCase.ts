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

// Для майбутніх дій
export interface ICreateUserUseCase {
  execute(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<IUser>;
}

export interface IUpdateUserUseCase {
  execute(userId: string, userData: Partial<IUser>): Promise<IUser | null>;
}

export interface IDeleteUserUseCase {
  execute(userId: string): Promise<boolean>;
}
