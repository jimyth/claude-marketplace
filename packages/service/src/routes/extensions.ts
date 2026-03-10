import { FastifyInstance } from 'fastify';
import { IndexService } from '../services/index-service';
import { DownloadService } from '../services/download-service';
import archiver from 'archiver';

const indexService = new IndexService();
const downloadService = new DownloadService();

export async function extensionsRoute(fastify: FastifyInstance) {
  // Get extension info
  fastify.get('/extensions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const extension = await indexService.getExtension(id);
      if (!extension) {
        reply.code(404).send({ error: 'Extension not found' });
        return;
      }
      return extension;
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Failed to get extension' });
    }
  });

  // Download extension as ZIP
  fastify.get('/extensions/:id/download', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const extension = await indexService.getExtension(id);
      if (!extension) {
        reply.code(404).send({ error: 'Extension not found' });
        return;
      }

      // Set response headers for ZIP download
      reply.header('Content-Type', 'application/zip');
      reply.header('Content-Disposition', `attachment; filename="${id}.zip"`);

      // Create ZIP stream
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(reply.raw);

      // Add files to archive
      const files = await downloadService.fetchExtensionFiles(extension);
      for (const [filename, content] of files) {
        archive.append(Buffer.from(content), { name: filename });
      }

      await archive.finalize();
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Download failed' });
    }
  });

  // Publish extension
  fastify.post('/extensions', async (request, reply) => {
    const user = (request as any).user;
    const body = request.body as any;

    if (!body || !body.id || !body.files) {
      reply.code(400).send({ error: 'Missing required fields' });
      return;
    }

    try {
      const result = await downloadService.publishExtension(user.apiKey, body);
      return { success: true, ...result };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Publish failed' });
    }
  });
}
