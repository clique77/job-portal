import { IUserRepository, getUserRepository } from '../../data/repositories/UserRepositoryFactory';
import { IAuthService, RegisterData, LoginData, AuthResponse } from './AuthServiceInterfaces';
import { IUserService } from '../user/UserServiceInterfaces';
import { ITokenService } from '../token/TokenServiceInterfaces';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private userService: IUserService;
  private tokenService: ITokenService;

  constructor(userService: IUserService, tokenService: ITokenService) {
    this.userRepository = getUserRepository();
    this.userService = userService;
    this.tokenService = tokenService;
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
    const user = await this.userService.validateCredentials(data.email, data.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const token = this.tokenService.generateToken(user);

    return {
      user: this.userService.formatUser(user),
      token
    }
  }

  validateToken(token: string): any {
    return tokenService.verifyToken(token);
  }
}

import tokenService from '../token/TokenService';
import userService from '../user/UserService';

export const authService = new AuthService(userService, tokenService);
export default authService;
