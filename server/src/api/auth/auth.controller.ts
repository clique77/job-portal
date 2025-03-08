import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../../core/auth/auth.service';
import cookieService from '../../core/common/cookie.service';
import errorHandlerService from '../../core/common/error-handler.service';
import { UserRole } from '../../data/models/User';

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
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const userData = request.body;
      const result = await authService.register(userData);

      cookieService.setAuthCookie(reply, result.token);
      return result;
    } catch (error) {
      return errorHandlerService.handleError(request, reply, error, 400);
    }
  }

  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const result = await authService.login({ email, password });

      cookieService.setAuthCookie(reply, result.token);
      return result;
    } catch (error) {
      return errorHandlerService.handleError(request, reply, error, 401);
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    cookieService.clearAuthCookie(reply);
    return { message: 'Successfully logged out' };
  }
}

export const authController = new AuthController();
export default authController;
