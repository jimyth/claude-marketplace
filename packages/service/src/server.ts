import Fastify from 'fastify';
import cors from '@fastify/cors';
import { searchRoute } from './routes/search';
import { extensionsRoute } from './routes/extensions';
import { authRoute } from './routes/auth';
import { apiKeyAuth } from './middleware/auth';

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: true,
});

// Register middleware
fastify.addHook('onRequest', apiKeyAuth);

// Register routes
fastify.register(searchRoute, { prefix: '/api' });
fastify.register(extensionsRoute, { prefix: '/api' });
fastify.register(authRoute, { prefix: '/api/auth' });

// Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
