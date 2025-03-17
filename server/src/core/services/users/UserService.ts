import { IUser } from "../../../data/models/User";
import { userRepository } from "../../../data/repositories/user/UserRepository";
import { GetAllUsersAction } from "../../useCases/user/GetAllUsers";
import { GetUserByIdAction } from "../../useCases/user/GetUserById";
import { FormatUserAction } from "../../useCases/user/utils/FormatUser";
import { ValidateCredentialsAction } from "../../useCases/user/utils/ValidateCredentials";
import { IUserService } from "./interfaces/UserServiceInterfaces";

export class UserService implements IUserService {
  private getUserByIdAction: GetUserByIdAction;
  private getAllUsersAction: GetAllUsersAction;
  private validateCredentialsAction: ValidateCredentialsAction;
  private formatUserAction: FormatUserAction;

  constructor() {
    this.getUserByIdAction = new GetUserByIdAction(userRepository);
    this.getAllUsersAction = new GetAllUsersAction(userRepository);
    this.validateCredentialsAction = new ValidateCredentialsAction(userRepository);
    this.formatUserAction = new FormatUserAction();
  }

  async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
    return this.getUserByIdAction.execute(userId);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Omit<IUser, 'password'>[], total: number }> {
    return this.getAllUsersAction.execute(page, limit);
  }

  async validateCredentials(email: string, password: string): Promise<IUser | null> {
    return this.validateCredentialsAction.execute(email, password);
  }

  formatUser(user: IUser) {
    return this.formatUserAction.execute(user);
  }
}

export default new UserService();
