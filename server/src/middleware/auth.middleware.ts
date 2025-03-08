import { FastifyRequest, FastifyReply} from 'fastify';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.status(401).send({ message: 'You are not authorized to access this resource' });
  }
};

export const checkRole = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      //@ts-ignore
      const userRole = request.user.role;

      if (!roles.includes(userRole)) {
        return reply.status(403).send({ message: 'You don\'t have permission to access this resource' });
      }
    } catch (error) {
      reply.code(401).send({ mesage: 'Unauthorized' });
    }
  };
};
