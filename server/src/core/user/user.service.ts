import { IUser } from '../../data/models/User';
import { IUserRepository, getUserRepository } from '../../data/repositories';
import { IUserService } from './user.service.interface';
import mongoose from 'mongoose';

export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = getUserRepository();
  }

  async getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as Omit<IUser, 'password'>;
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: Omit<IUser, 'password'>[],total: number }> {
    const skip = (page - 1) * limit;

    const users = await this.userRepository.findAll(skip, limit);
    const total = await this.userRepository.count();

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPassword as Omit<IUser, 'password'>[],
      total,
    };
  }

  formatUser(user: IUser) {
    return {
      id: user._id instanceof mongoose.Types.ObjectId
        ? user._id.toString()
        : String(user._id),
      name: user.name,
      email: user.email,
      role: user.role
    };
  }
}

export default new UserService();
