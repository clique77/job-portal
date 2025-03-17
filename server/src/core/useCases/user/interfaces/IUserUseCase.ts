import { IUser } from "../../../../data/models/User";
import { UserResponse } from '../../../services/users/interfaces/UserServiceInterfaces';

export interface IGetUserByIdAction {
  execute(userId: string): Promise<Omit<IUser, 'password'> | null>;
}

export interface IGetAllUsersAction {
  execute(page?: number, limit?: number): Promise<{
    users: Omit<IUser, 'password'>[],
    total: number
  }>;
}

export interface IValidateCredentialsAction {
  execute(email: string, password: string): Promise<IUser | null>;
}

export interface IFormatUserAction {
  execute(user: IUser): UserResponse;
}

// Для майбутніх дій
export interface ICreateUserAction {
  execute(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<IUser>;
}

export interface IUpdateUserAction {
  execute(userId: string, userData: Partial<IUser>): Promise<IUser | null>;
}

export interface IDeleteUserAction {
  execute(userId: string): Promise<boolean>;
}
