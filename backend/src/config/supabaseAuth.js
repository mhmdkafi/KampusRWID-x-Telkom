import { createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from './env.js';

let JWKS;
if (env.SUPABASE_URL) {
  JWKS = createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`));
}

export async function verifySupabaseJWT(token) {
  if (!JWKS) throw new Error('JWKS belum siap (SUPABASE_URL?)');
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `${env.SUPABASE_URL}/auth/v1`
  });
  return payload;
}

export function authGuard() {
  return async function (request, reply) {
    const header = request.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return reply.code(401).send({ message: 'Unauthorized' });
    try {
      const payload = await verifySupabaseJWT(token);
      request.user = payload;
    } catch {
      return reply.code(401).send({ message: 'Invalid token' });
    }
  };
}