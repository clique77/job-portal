import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../../../data/models/User';
import { IAuthService } from '../../../core/services/auth/interfaces/AuthServiceInterfaces';
import { ICookieService } from '../../../core/services/common/cookie/interfaces/CookieServiceInterfaces';
import { IErrorHandlerService } from '../../../core/services/common/error-handler/interfaces/ErrorHandlerInterfaces';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  private authService: IAuthService;
  private cookieService: ICookieService;
  private errorHandlerService: IErrorHandlerService;

  constructor(authService: IAuthService, cookieService: ICookieService, errorHandlerService: IErrorHandlerService) {
    this.authService = authService;
    this.cookieService = cookieService;
    this.errorHandlerService = errorHandlerService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
    this.resendVerification = this.resendVerification.bind(this);
  }

  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const userData = request.body;
      const result = await this.authService.register(userData);

      // Don't set auth cookie after registration
      // this.cookieService.setAuthCookie(reply, result.token);
      return result;
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const result = await this.authService.login({ email, password });

      this.cookieService.setAuthCookie(reply, result.token);
      return result;
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 401);
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    this.cookieService.clearAuthCookie(reply);
    return { message: 'Successfully logged out' };
  }

  async verifyEmail(request: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) {
    try {
      await this.authService.verifyEmail(request.params.token);
      return { message: 'Email verified successfully' };
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }

  async resendVerification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as any).id;
      await this.authService.resendVerificationEmail(userId);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      return this.errorHandlerService.handleError(request, reply, error as Error, 400);
    }
  }
}

import { authService } from '../../../core/services/auth/AuthService';
import { cookieService } from '../../../core/services/common/cookie/CookieService';
import { errorHandlerService } from '../../../core/services/common/error-handler/ErrorHandlerService';

export const authController = new AuthController(authService, cookieService, errorHandlerService);
export default authController;
