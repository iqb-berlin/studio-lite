import {
  In, LessThan, MoreThan, Repository
} from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { findOrphanedSessionIds } from './orphaned-sessions';
import UserSession from '../entities/user-session.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { ACTIVE_THRESHOLD_MS } from '../app.constants';

describe('findOrphanedSessionIds', () => {
  let userSessionRepository: DeepMocked<Repository<UserSession>>;
  let refreshTokenRepository: DeepMocked<Repository<RefreshToken>>;

  const realDateNow = Date.now;

  beforeEach(() => {
    Date.now = jest.fn(() => 1000000);
    userSessionRepository = createMock<Repository<UserSession>>();
    refreshTokenRepository = createMock<Repository<RefreshToken>>();
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  const find = (scope?: { userId?: number, sessionId?: string }) => findOrphanedSessionIds(
    userSessionRepository,
    refreshTokenRepository,
    scope
  );

  it('should return the sessions no unexpired refresh token can resume', async () => {
    userSessionRepository.find.mockResolvedValue([
      { sessionId: 'sid-1' }, { sessionId: 'sid-2' }, { sessionId: 'sid-3' }
    ] as UserSession[]);
    refreshTokenRepository.find.mockResolvedValue([{ sessionId: 'sid-2' }] as RefreshToken[]);

    await expect(find()).resolves.toEqual(['sid-1', 'sid-3']);
  });

  it('should return nothing while every session is resumable', async () => {
    userSessionRepository.find.mockResolvedValue([{ sessionId: 'sid-1' }] as UserSession[]);
    refreshTokenRepository.find.mockResolvedValue([{ sessionId: 'sid-1' }] as RefreshToken[]);

    await expect(find()).resolves.toEqual([]);
  });

  // Without candidates there is nothing to ask the token table about, and an empty In()
  // would be a query over no ids at all.
  it('should not ask for tokens when no session qualifies', async () => {
    userSessionRepository.find.mockResolvedValue([]);

    await expect(find()).resolves.toEqual([]);
    expect(refreshTokenRepository.find).not.toHaveBeenCalled();
  });

  // Expired rows are the cleanup's business by expiry, and a session someone interacted
  // with moments ago can still be carrying a valid access token.
  it('should only consider unexpired sessions past their active phase', async () => {
    userSessionRepository.find.mockResolvedValue([]);

    await find();

    expect(userSessionRepository.find).toHaveBeenCalledWith({
      where: {
        expiresAt: MoreThan(new Date(1000000)),
        lastActivity: LessThan(new Date(1000000 - ACTIVE_THRESHOLD_MS))
      },
      select: { sessionId: true }
    });
  });

  it('should narrow the query to a single user or session when asked', async () => {
    userSessionRepository.find.mockResolvedValue([{ sessionId: 'sid-1' }] as UserSession[]);
    refreshTokenRepository.find.mockResolvedValue([]);

    await find({ userId: 7, sessionId: 'sid-1' });

    expect(userSessionRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 7, sessionId: 'sid-1' })
      })
    );
    expect(refreshTokenRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          sessionId: In(['sid-1']),
          expiresAt: MoreThan(new Date(1000000))
        })
      })
    );
  });
});
