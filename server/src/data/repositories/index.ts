import { UserMongoDBRepository } from "./user.mongodb.repository";
import { IUserRepository } from "./user.repository";

export * from './user.repository';

let userRepositoryInstance: IUserRepository | null = null;

export function getUserRepository(): IUserRepository {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserMongoDBRepository();
  }
  return userRepositoryInstance;
}
