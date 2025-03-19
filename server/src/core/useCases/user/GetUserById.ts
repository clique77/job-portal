import { IUser } from '../../../data/models/User';
import { IUserRepository } from '../../../data/repositories/user/UserRepository';
import { IGetUserByIdUseCase } from './interfaces/IUserUseCase';

export class GetUserByIdUseCase implements IGetUserByIdUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<Omit<IUser, 'password'> | null> {
    const user = await this.userRepository.findById(userId);

    if (!user) return null;

    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword as Omit<IUser, 'password'>;
  }
}
