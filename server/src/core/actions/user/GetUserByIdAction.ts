import { IUser } from '../../../data/models/User';
import { IUserRepository } from '../../../data/repositories/user/UserRepository';
import { IGetUserByIdAction } from './interfaces/IUserActions';

export class GetUserByIdAction implements IGetUserByIdAction {
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
