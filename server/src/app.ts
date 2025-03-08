import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import config from './config';
import routes from './routes';

const app = fastify({
  logger: true,
});

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

app.register(jwt, {
  secret: config.jwtSecret,
  sign: {
    expiresIn: '7d',
  }
});

app.register(cookie, {
  secret: config.cookieSecret,
  hook: 'onRequest',
});

app.register(routes);

export default app;

