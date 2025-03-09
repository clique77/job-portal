import { UserMongoDBRepository } from "./user/UserMongoDbrepository";
import { IUserRepository } from "./user/UserRepository";

export * from './user/UserRepository';

let userRepositoryInstance: IUserRepository | null = null;

export function getUserRepository(): IUserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserMongoDBRepository();
  }
  return userRepositoryInstance;
}
