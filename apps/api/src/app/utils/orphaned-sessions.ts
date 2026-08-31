import {
  In, LessThan, MoreThan, Repository
} from 'typeorm';
import UserSession from '../entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ACTIVE_THRESHOLD_MS } from '../app.constants';

/**
 * The sessions nobody can return to: nothing interacted with them for longer than the active
 * phase, so no access token issued for them can still be valid, and no unexpired refresh token is
 * left to renew them. There should never be such a row -- a session is supposed to go when its
 * last token does -- which is exactly why both the display and the cleanup ask the same question
 * here rather than each in their own words.
 *
 * Rows whose own expiresAt has passed are left out: those are expired, not orphaned, and the
 * cleanup deletes them by that condition anyway.
 *
 * Read order matters. Sessions first, tokens second: a refresh landing between the two reads shows
 * up as a live token and spares its session. The other order would let the same refresh hide the
 * token from us and take a working session with it. The active-phase condition covers the other
 * direction -- a login writes its session row a moment before its first refresh token, and while
 * that write is fresh the row counts as active.
 *
 * @param scope Narrows the search to one user or one session; empty means every session there is.
 */
export async function findOrphanedSessionIds(
  userSessionRepository: Repository<UserSession>,
  refreshTokenRepository: Repository<RefreshToken>,
  scope: { userId?: number, sessionId?: string } = {}
): Promise<string[]> {
  const nowMs = Date.now();
  const now = new Date(nowMs);
  const candidates = await userSessionRepository.find({
    where: {
      ...(scope.userId ? { userId: scope.userId } : {}),
      ...(scope.sessionId ? { sessionId: scope.sessionId } : {}),
      expiresAt: MoreThan(now),
      lastActivity: LessThan(new Date(nowMs - ACTIVE_THRESHOLD_MS))
    },
    select: { sessionId: true }
  });
  if (candidates.length === 0) {
    return [];
  }
  const candidateIds = candidates.map(session => session.sessionId);
  const liveTokens = await refreshTokenRepository.find({
    where: { sessionId: In(candidateIds), expiresAt: MoreThan(now) },
    select: { sessionId: true }
  });
  const resumableIds = new Set(liveTokens.map(token => token.sessionId));
  return candidateIds.filter(id => !resumableIds.has(id));
}
