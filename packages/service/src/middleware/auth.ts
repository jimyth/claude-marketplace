import { FastifyRequest, FastifyReply } from 'fastify';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/health', '/api/auth', '/api/search'];

// For development, we'll accept any API key
// In production, this should validate against a database
const VALID_API_KEYS = new Set<string>();

export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth for public paths
  if (PUBLIC_PATHS.some(p => request.url.startsWith(p))) {
    return;
  }

  // Skip auth for read-only search
  if (request.method === 'GET' && request.url.startsWith('/api/extensions/')) {
    return;
  }

  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.code(401).send({ error: 'Missing API key' });
    return;
  }

  const apiKey = authHeader.slice(7);

  // For now, accept any non-empty API key
  // TODO: Validate against database
  if (!apiKey || apiKey.length < 10) {
    reply.code(401).send({ error: 'Invalid API key' });
    return;
  }

  // Store user info in request
  (request as any).user = { apiKey };
}

/**
 * Register a new API key (for testing)
 */
export function registerApiKey(key: string): void {
  VALID_API_KEYS.add(key);
}
