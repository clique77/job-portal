import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../../data/models/User';

export const checkAdminRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  if (user.role !== UserRole.ADMIN) {
    return reply.code(403).send({ error: 'Access denied. Admin role required.' });
  }
};

export const checkEmployerRole = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
  
  if (user.role !== UserRole.EMPLOYER && user.role !== UserRole.ADMIN) {
    return reply.code(403).send({ error: 'Access denied. Employer role required.' });
  }
}; 