import { IUser } from "../../../data/models/User";
import { getUserRepository } from "../../../data/repositories/user/UserRepositoryFactory";
import { GetAllUsersAction } from "../../actions/user/GetAllUsersAction";
import { GetUserByIdAction } from "../../actions/user/GetUserByIdAction";
import { FormatUserAction } from "../../actions/user/utils/FormatUserAction";
import { ValidateCredentialsAction } from "../../actions/user/utils/ValidateCredentialsActions";
import { IUserService } from "./interfaces/UserServiceInterfaces";

export class UserService implements IUserService {
  private getUserByIdAction: GetUserByIdAction;
  private getAllUsersAction: GetAllUsersAction;
  private validateCredentialsAction: ValidateCredentialsAction;
  private formatUserAction: FormatUserAction;

  constructor() {
    this.getUserByIdAction = new GetUserByIdAction(getUserRepository());
    this.getAllUsersAction = new GetAllUsersAction(getUserRepository());
    this.validateCredentialsAction = new ValidateCredentialsAction(getUserRepository());
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
