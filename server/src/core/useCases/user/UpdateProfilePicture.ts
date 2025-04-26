import { IUser } from "../../../data/models/User";
import { IUserRepository } from "../../../data/repositories/user/UserRepository";
import { IUpdateProfilePictureUseCase } from "./interfaces/IUserUseCase";

export class UpdateProfilePicture implements IUpdateProfilePictureUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, picturePath: string): Promise<Omit<IUser, 'password'> | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) throw new Error('User not found');

      const updatedUser = await this.userRepository.updateProfilePicture(id, picturePath);
      if (!updatedUser) return null;

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword as Omit<IUser, 'password'>;
    } catch (error) {
      throw new Error(`Failed to upload profile picture: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    }
  }
}