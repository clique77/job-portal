import { IUser } from "../../../data/models/User";
import { IUserRepository } from "../../../data/repositories/user/UserRepository";
import { IGetAllUsersUseCase } from "./interfaces/IUserUseCase";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(page: number = 1, limit: number = 10): Promise<{ users: Omit<IUser, 'password'>[],total: number }> {
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
}
