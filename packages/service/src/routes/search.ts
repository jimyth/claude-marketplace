import { FastifyInstance } from 'fastify';
import { IndexService } from '../services/index-service';

const indexService = new IndexService();

export async function searchRoute(fastify: FastifyInstance) {
  // Search extensions
  fastify.get('/search', async (request, reply) => {
    const query = (request.query as any).q || '';
    const scope = (request.query as any).scope || 'all';

    try {
      const results = await indexService.search(query, scope);
      return { results };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Search failed' });
    }
  });
}
