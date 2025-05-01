import { IUser } from "../../../data/models/User";
import { IUserRepository } from "../../../data/repositories/user/UserRepository";
import { IUpdateUserProfileUseCase } from "./interfaces/IUserUseCase";

export interface UserData {
  name?: string;
  phoneNumber?: string;
  location?: string;
  title?: string;
  bio?: string;
  socialLinks?: string[];
  workExperience?: {
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
  }[];
}

export class UpdateUserProfile implements IUpdateUserProfileUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, userData: UserData): Promise<Omit<IUser, 'password'> | null> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new Error('User not found');
      }

      const updateUser = await this.userRepository.updateProfile(id, userData);

      if (!updateUser) {
        return null;
      }

      const { password, ...userWithoutPassword } = updateUser.toObject();
      return userWithoutPassword as Omit<IUser, 'password'>;
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}