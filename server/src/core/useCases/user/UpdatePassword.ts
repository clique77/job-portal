import { IUser } from "../../../data/models/User";
import { IUserRepository } from "../../../data/repositories/user/UserRepository";
import { IUpdatePasswordUseCase } from "./interfaces/IUserUseCase";
import bcrypt from 'bcrypt';

export class UpdatePassword implements IUpdatePasswordUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(id: string, currentPassword: string, newPassword: string): Promise<Omit<IUser, 'password'> | null> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) throw new Error('User not found');

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) throw new Error('Invalid current password');

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await this.userRepository.updatePassword(id, hashedPassword);
      if (!updatedUser) return null;

      const { password, ...userWithoutPassword } = updatedUser.toObject();
      return userWithoutPassword as Omit<IUser, 'password'>;
    } catch (error) {
      throw new Error(`'Failed to update password: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}