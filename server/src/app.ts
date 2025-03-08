import fastify from 'fastify';

const app = fastify({
  logger: true,
});

app.get('/api/health', async () => {
  return { status: 'ok', message: 'Server is running' };
});

export default app;

