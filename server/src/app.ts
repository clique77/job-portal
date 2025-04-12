import fastify from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import config from './config';
import routes from './routes';
import cors from '@fastify/cors';
import database from './data/MongodbConnection';

export const build = async () => {
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  if (process.env.NODE_ENV !== 'test' || !process.env.IN_MEMORY_DB) {
    await database.connect();
  }

  return app;
}
const app = fastify({
  logger: true,
});

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}

app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

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

