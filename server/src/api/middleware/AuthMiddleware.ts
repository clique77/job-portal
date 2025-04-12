import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../../data/models/User';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // First try cookie-based authentication
    await request.jwtVerify();
  } catch (cookieError) {
    // If cookie auth fails, try Bearer token
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = await request.server.jwt.verify(token);
        request.user = decoded;
      } catch (tokenError) {
        reply.status(401).send({ message: 'Invalid or expired token' });
      }
    } else {
      reply.status(401).send({ message: 'Authentication required' });
    }
  }
};

export const checkRole = (roles: UserRole[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      //@ts-ignore
      const userRole = request.user.role;

      if (!roles.includes(userRole)) {
        return reply.status(403).send({ message: 'You don\'t have permission to access this resource' });
      }
    } catch (error) {
      reply.code(401).send({ message: 'Unauthorized' });
    }
  };
};
