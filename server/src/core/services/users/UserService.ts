import { IUser } from "../../../data/models/User";
import { userRepository } from "../../../data/repositories/user/UserRepository";
import { GetAllUsersUseCase } from "../../useCases/user/GetAllUsers";
import { GetUserByIdUseCase } from "../../useCases/user/GetUserById";
import { FormatUser } from "../../useCases/user/utils/FormatUser";
import { ValidateCredentials } from "../../useCases/user/utils/ValidateCredentials";
import { IUserService } from "./interfaces/IUserService";

export class UserService implements IUserService {
  private getUserByIdUseCase: GetUserByIdUseCase;
  private getAllUsersUseCase: GetAllUsersUseCase;
  private validateCredentialsUseCase: ValidateCredentials;
  private formatUserUseCase: FormatUser;

  constructor() {
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.validateCredentialsUseCase = new ValidateCredentials(userRepository);
    this.formatUserUseCase = new FormatUser();
  }

  async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
    return this.getUserByIdUseCase.execute(userId);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Omit<IUser, 'password'>[], total: number }> {
    return this.getAllUsersUseCase.execute(page, limit);
  }

  async validateCredentials(email: string, password: string): Promise<IUser | null> {
    return this.validateCredentialsUseCase.execute(email, password);
  }

  formatUser(user: IUser) {
    return this.formatUserUseCase.execute(user);
  }
}

export default new UserService();
