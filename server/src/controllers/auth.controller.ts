import { FastifyRequest, FastifyReply } from 'fastify';
import AuthService from '../services/auth.service';
import { UserRole } from '../database/models/User';

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

class AuthController {
  async register(request: FastifyRequest<{ Body: RegisterRequest }>, reply: FastifyReply) {
    try {
      const userData = request.body;
      const result = await AuthService.register(userData);

      reply.setCookie('token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 1000
      });

      return result;
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ message: (error as Error).message });
    }
  }

  async login(request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) {
    try {
      const { email, password } = request.body;
      const result = await AuthService.login({ email, password });

      reply.setCookie('token', result.token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 1000
      });

      return result;
    } catch (error) {
      request.log.error(error);
      return reply.status(401).send({ message: (error as Error).message });
    }
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      //@ts-ignore
      const userId = request.user.id;

      const user = await AuthService.getUserById(userId);
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return { user };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: (error as Error).message });
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { page?: string, limit: string };
      const page = query.page ? parseInt(query.page as string) : 1;
      const limit = query.limit ? parseInt(query.limit as string) : 10;

      const result = await AuthService.getAllUsers(page, limit);

      return {
        users: result.users,
        pagination: {
          total: result.total,
          page: page,
          limit: limit,
          pages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: 'Error fetching users' });
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie('token', { path: '/'});
    return { message: 'Logged out successfully' };
  }
}

export default new AuthController();
