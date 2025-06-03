import { IUserRepository } from '../../../data/repositories/user/UserRepository';
import { IAuthService, RegisterData, LoginData, AuthResponse } from '../../services/auth/interfaces/AuthServiceInterfaces';
import { ITokenService } from '../../services/common/token/interfaces/TokenServiceInterfaces';
import { IUserService } from '../users/interfaces/IUserService';
import { emailService } from '../common/email/EmailService';
import crypto from 'crypto';

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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await this.userRepository.create({
      ...data,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    // Generate verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    try {
      await emailService.sendVerificationEmail(newUser, verificationUrl);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    const token = this.tokenService.generateToken(newUser);

    return {
      user: this.userService.formatUser(newUser),
      token
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    console.log('Verifying token:', token);
    
    // Find user with the verification token
    const user = await this.userRepository.findOne({ 
      emailVerificationToken: token,
      isEmailVerified: false // Only find unverified users
    });
    
    console.log('User found for token:', user);

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new Error('Verification token has expired');
    }

    try {
      // Update user verification status
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      
      return true;
    } catch (error) {
      console.error('Error updating user verification status:', error);
      throw new Error('Failed to verify email. Please try again.');
    }
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Generate verification URL
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationUrl);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await this.userService.validateCredentials(data.email, data.password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Email is not verified. Please check your inbox and verify your email before logging in.');
    }

    const token = this.tokenService.generateToken(user);

    return {
      user: this.userService.formatUser(user),
      token
    };
  }

  validateToken(token: string): any {
    return this.tokenService.verifyToken(token);
  }
}

import TokenService from '../../services/common/token/TokenService';
import UserService from '../users/UserService';
import { userRepository } from '../../../data/repositories/user/UserRepository';

export const authService = new AuthService(userRepository, UserService, TokenService);
export default authService;
