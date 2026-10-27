import { createHmac } from 'node:crypto';
export function anonymousIdentity(userId: string, secret: string) {
  const seed = createHmac('sha256', secret).update(`avatar:${userId}`).digest('hex');
  const handle = `neighbor-${createHmac('sha256', secret).update(`handle:${userId}`).digest('hex').slice(0, 12)}`;
  return { handle, avatarSeed: seed };
}
