import { IUser } from "../../../../data/models/User";
import { IUserRepository } from "../../../../data/repositories/user/UserRepository";

export class ValidateCredentialsAction {
  private userRepository: IUserRepository;
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(email: string, password: string): Promise<IUser | null> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
