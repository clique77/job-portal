import { IUserRepository } from '../../../data/repositories/user/UserRepository';
import { IAuthService, RegisterData, LoginData, AuthResponse } from '../../services/auth/interfaces/AuthServiceInterfaces';
import { ITokenService } from '../../services/common/token/interfaces/TokenServiceInterfaces';
import { IUserService } from '../users/interfaces/IUserService';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private userService: IUserService;
  private tokenService: ITokenService;

  constructor(userRepository: IUserRepository, userService: IUserService, tokenService: ITokenService) {
    this.userRepository = userRepository;
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

import tokenService from '../../services/common/token/TokenService';
import userService from '../users/UserService';
import { userRepository } from '../../../data/repositories/user/UserRepository';

export const authService = new AuthService(userRepository, userService, tokenService);
export default authService;
