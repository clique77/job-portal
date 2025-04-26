import { IUser } from "../../../data/models/User";
import { userRepository } from "../../../data/repositories/user/UserRepository";
import { GetAllUsersUseCase } from "../../useCases/user/GetAllUsers";
import { GetUserByIdUseCase } from "../../useCases/user/GetUserById";
import { FormatUser } from "./utils/FormatUser";
import { ValidateCredentials } from "./utils/ValidateCredentials";
import { IUserService } from "./interfaces/IUserService";
import { UpdateUserProfile, UserData } from "../../useCases/user/UpdateUserProfile";
import { UpdatePassword } from "../../useCases/user/UpdatePassword";
import { UpdateProfilePicture } from "../../useCases/user/UpdateProfilePicture";

export class UserService implements IUserService {
  private getUserByIdUseCase: GetUserByIdUseCase;
  private getAllUsersUseCase: GetAllUsersUseCase;
  private updateUserProfileUseCase: UpdateUserProfile;
  private updatePasswordUseCase: UpdatePassword;
  private updateProfilePictureUseCase: UpdateProfilePicture;
  private validateCredentialsUseCase: ValidateCredentials;
  private formatUserUseCase: FormatUser;

  constructor() {
    this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
    this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
    this.validateCredentialsUseCase = new ValidateCredentials(userRepository);
    this.formatUserUseCase = new FormatUser();
    this.updateUserProfileUseCase = new UpdateUserProfile(userRepository);
    this.updatePasswordUseCase = new UpdatePassword(userRepository);
    this.updateProfilePictureUseCase = new UpdateProfilePicture(userRepository);
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

  async updateUserProfile(userId: string, userData: UserData): Promise<Omit<IUser, 'password'> | null> {
    return this.updateUserProfileUseCase.execute(userId, userData);
  }
  
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<Omit<IUser, 'password'> | null> {
    return this.updatePasswordUseCase.execute(userId, currentPassword, newPassword);
  }

  async updateProfilePicture(userId: string, picturePath: string): Promise<Omit<IUser, 'password'> | null> {
    return this.updateProfilePictureUseCase.execute(userId, picturePath);
  }

  formatUser(user: IUser) {
    return this.formatUserUseCase.execute(user);
  }
}

export default new UserService();
