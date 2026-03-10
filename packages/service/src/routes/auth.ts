import { FastifyInstance } from 'fastify';

export async function authRoute(fastify: FastifyInstance) {
  // GitHub OAuth redirect
  fastify.get('/github', async (request, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      reply.code(500).send({ error: 'GitHub OAuth not configured' });
      return;
    }

    const redirectUri = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/callback`;
    const state = Math.random().toString(36).substring(7);

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'repo');
    authUrl.searchParams.set('state', state);

    reply.redirect(authUrl.toString());
  });

  // GitHub OAuth callback
  fastify.get('/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };

    if (!code) {
      reply.code(400).send({ error: 'Missing authorization code' });
      return;
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenResponse.json();
      const accessToken = (data as any).access_token;

      if (!accessToken) {
        reply.code(400).send({ error: 'Failed to obtain access token' });
        return;
      }

      // TODO: Store token securely associated with user
      // For now, just return success
      reply.send({
        success: true,
        message: 'GitHub authorization successful. You can now publish extensions.',
      });
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'OAuth callback failed' });
    }
  });
}
