import fastify, { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import config from './config';
import routes from './routes';
import cors from '@fastify/cors';
import database from './data/MongodbConnection';
import path from 'path';
import fastifyStatic from '@fastify/static';

const bootstrapFastify = (): FastifyInstance => {
  const server = fastify({
      exposeHeadRoutes: false,
      connectionTimeout: 20000,
      ignoreTrailingSlash: false,
      logger: config.nodeEnv !== 'development' ? false : {
          level: "debug",
          transport: {
              target: "pino-pretty",
              options: {
                  colorize: true,
                  translateTime: "HH:MM:ss Z",
                  ignore: "pid,hostname",
              },
          },
      },
      disableRequestLogging: true,
  });

  if (config.nodeEnv === 'development') {
      server.ready(() => {
          console.log('\nAPI Structure\n', server.printRoutes());
      });
  }

  return server;
};

const app = bootstrapFastify();

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

app.register(multipart, {
  limits: {
    fileSize: config.uploads.maxSize,
    files: 1
  }
});

app.register(fastifyStatic, {
  root: config.uploads.directory,
  prefix: '/uploads/',
  decorateReply: false
});

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not defined');
}
;
app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

