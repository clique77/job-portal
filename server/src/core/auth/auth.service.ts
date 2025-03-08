import { UserRole } from '../../data/models/User';
import { IUserRepository, getUserRepository } from '../../data/repositories';
import tokenService from '../token/token.service';
import userService from '../user/user.service';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

export class AuthService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = getUserRepository();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser = await this.userRepository.create(data);
    const token = tokenService.generateToken(newUser);

    return {
      user: userService.formatUser(newUser),
      token
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = tokenService.generateToken(user);

    return {
      user: userService.formatUser(user),
      token
    };
  }

  validateToken(token: string): any {
    return tokenService.verifyToken(token);
  }
}

export default new AuthService();
