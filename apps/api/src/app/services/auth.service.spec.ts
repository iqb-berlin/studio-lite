import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  In, InsertQueryBuilder, LessThan, MoreThan, QueryFailedError, Repository, SelectQueryBuilder
} from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { UsedRefreshToken } from '../entities/used-refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import User from '../entities/user.entity';
import { ACTIVE_THRESHOLD_MS, REFRESH_TOKEN_REUSE_GRACE_MS } from '../app.constants';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMocked<UsersService>;
  let jwtService: DeepMocked<JwtService>;
  let refreshTokenRepository: DeepMocked<Repository<RefreshToken>>;
  let userSessionRepository: DeepMocked<Repository<UserSession>>;
  let usedRefreshTokenRepository: DeepMocked<Repository<UsedRefreshToken>>;

  const realDateNow = Date.now;

  beforeEach(async () => {
    Date.now = jest.fn(() => 1000000);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: ReviewService,
          useValue: createMock<ReviewService>()
        },
        {
          provide: JwtService,
          useValue: createMock<JwtService>()
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: createMock<Repository<RefreshToken>>()
        },
        {
          provide: getRepositoryToken(UserSession),
          useValue: createMock<Repository<UserSession>>()
        },
        {
          provide: getRepositoryToken(UsedRefreshToken),
          useValue: createMock<Repository<UsedRefreshToken>>()
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>()
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    userSessionRepository = module.get(getRepositoryToken(UserSession));
    usedRefreshTokenRepository = module.get(getRepositoryToken(UsedRefreshToken));
    // A deep mock answers every lookup with an object, which would make every unknown token look
    // like an exchanged one.
    usedRefreshTokenRepository.findOne.mockResolvedValue(null);
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.sign.mockReturnValue('atoken');
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);

      const result = await service.login({ id: 1, name: 'user', reviewId: 0 });

      expect(result.accessToken).toBe('atoken');
      expect(result.refreshToken).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        username: 'user',
        sub: 1,
        sub2: 0
      }));
      expect(userSessionRepository.upsert).toHaveBeenCalled();
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should create an independent new session on every fresh login (no cross-session reuse)', async () => {
      // Another browser of the same user already has a very recent session.
      const otherBrowserSession = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 1,
        lastActivity: new Date(Date.now() - 50) // 50ms ago — would have been reused before
      } as UserSession;
      userSessionRepository.findOne.mockResolvedValue(otherBrowserSession);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);
      jwtService.sign.mockReturnValue('new-token');

      await service.login({ id: 1, name: 'user', reviewId: 0 });

      // A brand new session is created instead of latching onto the other browser's session.
      expect(userSessionRepository.upsert).toHaveBeenCalled();
      expect(userSessionRepository.update).not.toHaveBeenCalledWith(
        { userId: 1, sessionId: otherBrowserSession.sessionId },
        expect.any(Object)
      );
      expect(jwtService.sign).not.toHaveBeenCalledWith(
        expect.objectContaining({ sid: otherBrowserSession.sessionId })
      );
    });

    // The browser sends the id for a new session with every login; it only counts when there is
    // no session of the token to continue. An expired row is no such session (#2115).
    it('should continue the unexpired session of the token rather than open the chosen one (#2115)', async () => {
      const validSid = '550e8400-e29b-41d4-a716-446655440000';
      jwtService.sign.mockReturnValue('reused-token');
      userSessionRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.login({ id: 1, name: 'user', reviewId: 0 }, validSid, '7c9e6679-7425-40de-944b-e07fc1f90ae7');

      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        sid: validSid
      }));
      expect(userSessionRepository.update).toHaveBeenCalledWith(
        { userId: 1, sessionId: validSid, expiresAt: MoreThan(expect.any(Date)) },
        expect.any(Object)
      );
      expect(userSessionRepository.upsert).not.toHaveBeenCalled();
    });

    // The session the client names is gone (logged out, deleted by an admin): it is not revived.
    it('should open a session of its own when the one handed back no longer exists', async () => {
      const staleSid = '550e8400-e29b-41d4-a716-446655440000';
      userSessionRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });

      await service.login({ id: 1, name: 'user', reviewId: 0 }, staleSid);

      const { sessionId: newSid } = userSessionRepository.upsert.mock.calls[0][0] as UserSession;
      expect(newSid).not.toBe(staleSid);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: newSid }));
    });

    // A login whose answer was lost has opened a session under this id already; the next one
    // continues it instead of leaving it behind (#2151).
    it.each([
      ['without a token', undefined],
      ['whose token names a session that has ended', '550e8400-e29b-41d4-a716-446655440000']
    ])('should open the session under the id the client chose for it, %s (#2151)', async (_, staleSid) => {
      const chosenSid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      userSessionRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });

      await service.login({ id: 1, name: 'user', reviewId: 0 }, staleSid, chosenSid);

      expect(userSessionRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1, sessionId: chosenSid }),
        expect.anything()
      );
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: chosenSid }));
    });

    // The ids arrive in the request body unchecked.
    it.each([
      ['no session id', 'not-a-session-id'],
      ['no string', JSON.parse('["7c9e6679-7425-40de-944b-e07fc1f90ae7"]')]
    ])('should open the session under a random id when the chosen one is %s', async (_, chosenSid) => {
      await service.login({ id: 1, name: 'user', reviewId: 0 }, undefined, chosenSid);

      const { sessionId } = userSessionRepository.upsert.mock.calls[0][0] as UserSession;
      expect(sessionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(sessionId).not.toEqual(chosenSid);
    });

    // The cleanup and the status of a session find its tokens by the id alone; two accounts
    // sharing one id would read and delete each other's sessions. The database refuses the second.
    const sessionIdTaken = (): QueryFailedError => new QueryFailedError(
      'INSERT INTO "user_session"',
      [],
      Object.assign(new Error('duplicate key value'), { code: '23505', constraint: 'uq_user_session_session_id' })
    );

    it('should open a session under a random id when another account holds the chosen one', async () => {
      const takenSid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      userSessionRepository.upsert.mockRejectedValueOnce(sessionIdTaken());
      userSessionRepository.exists.mockResolvedValue(false);

      await service.login({ id: 1, name: 'user', reviewId: 0 }, undefined, takenSid);

      const { sessionId: randomSid } = userSessionRepository.upsert.mock.calls[1][0] as UserSession;
      expect(randomSid).not.toBe(takenSid);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: randomSid }));
    });

    // Two logins from the same storage at once: the database refuses the second row with the id
    // although it is the account's own, and only the owner of the row tells the two cases apart.
    it('should keep the chosen id when another login of the same account wrote it in the same moment', async () => {
      const chosenSid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      userSessionRepository.upsert.mockRejectedValueOnce(sessionIdTaken());
      userSessionRepository.exists.mockResolvedValue(true);

      await service.login({ id: 1, name: 'user', reviewId: 0 }, undefined, chosenSid);

      expect(userSessionRepository.exists).toHaveBeenCalledWith({ where: { userId: 1, sessionId: chosenSid } });
      expect(userSessionRepository.upsert).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: chosenSid }));
    });

    // A session opened anew under the id of an ended one is another row; tokens of the ended one
    // are told apart by the row they name (#2151).
    it('should name the row of the session in the access token (#2151)', async () => {
      const sid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      userSessionRepository.findOne.mockResolvedValue({ id: 42, userId: 1, sessionId: sid } as UserSession);

      await service.login({ id: 1, name: 'user', reviewId: 0 }, undefined, sid);

      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid, rid: 42 }));
    });

    it('should refuse the login when its session is gone before the tokens are issued', async () => {
      userSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.login({ id: 1, name: 'user', reviewId: 0 }))
        .rejects.toThrow(UnauthorizedException);
      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    });

    // A review link is no account: nothing is left behind that could be resumed. It does not take the
    // id for a new session either; the browser keeps that id for its next account login (#2151).
    it('should give a review login neither a session nor a refresh token', async () => {
      const chosenSid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      jwtService.sign.mockReturnValue('review-token');

      const result = await service.login({ id: 0, name: '', reviewId: 5 }, undefined, chosenSid);

      expect(result).toEqual({ accessToken: 'review-token', refreshToken: '' });
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sub: 0, sub2: 5 }));
      expect(jwtService.sign).not.toHaveBeenCalledWith(expect.objectContaining({ sid: chosenSid }));
      expect(userSessionRepository.upsert).not.toHaveBeenCalled();
      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
    });

    describe('on a fresh login', () => {
      // Their refresh tokens go with them through the cascade. Deleted by the ids found first, the
      // token another login has just written under a reused id would go as well (#2151).
      it('should delete the expired sessions of the user and leave their tokens to the cascade (#2151)', async () => {
        userSessionRepository.find.mockResolvedValue([{ sessionId: 'expired-1' } as UserSession]);

        await service.login({ id: 1, name: 'user', reviewId: 0 });

        expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 1, expiresAt: LessThan(expect.any(Date)) });
        expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
        expect(refreshTokenRepository.createQueryBuilder).not.toHaveBeenCalled();
      });
    });
  });

  describe('refreshAccessToken', () => {
    it('should rotate the refresh token but keep the same session identity', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const mockToken = {
        tokenHash: 'token-hash',
        userId: 1,
        sessionId: 'session-1',
        expiresAt
      } as RefreshToken;
      const session = {
        id: 42,
        userId: 1,
        sessionId: 'session-1',
        lastActivity: new Date(),
        expiresAt
      } as UserSession;

      refreshTokenRepository.findOne.mockResolvedValue(mockToken);
      userSessionRepository.findOne.mockResolvedValue(session);
      userSessionRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      usersService.findOne.mockResolvedValue({ id: 1, name: 'user' } as User);
      jwtService.sign.mockReturnValue('new-atoken');

      const result = await service.refreshAccessToken('valid-token');

      expect(result?.accessToken).toBe('new-atoken');
      // Old refresh token is rotated out ...
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ tokenHash: 'token-hash' });
      // ... but the session itself is preserved (not deleted) and its identity kept.
      expect(userSessionRepository.delete).not.toHaveBeenCalled();
      // A refresh is not an interaction and no longer a liveness sign either: it leaves
      // the session row alone, so the inactivity window keeps counting from the last click.
      expect(userSessionRepository.update).not.toHaveBeenCalled();
      // The new access token names the row, as the one from the login did (#2151).
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: 'session-1', rid: 42 }));
    });

    // A session with no unexpired refresh token is reported as orphaned and may be
    // deleted. Dropping the old token before writing the new one would put every rotating
    // session into that state for the width of one statement.
    it('should write the new refresh token before deleting the old one', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      refreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash', userId: 1, sessionId: 'session-1', expiresAt
      } as RefreshToken);
      userSessionRepository.findOne.mockResolvedValue({
        userId: 1, sessionId: 'session-1', lastActivity: new Date(), expiresAt
      } as UserSession);
      usersService.findOne.mockResolvedValue({ id: 1, name: 'user' } as User);
      jwtService.sign.mockReturnValue('new-atoken');

      await service.refreshAccessToken('valid-token');

      const saveOrder = refreshTokenRepository.save.mock.invocationCallOrder[0];
      const deleteOrder = refreshTokenRepository.delete.mock.invocationCallOrder[0];
      expect(saveOrder).toBeLessThan(deleteOrder);
    });

    // The row was deleted by a logout or an admin while this refresh was in flight;
    // re-creating it would undo that deletion.
    it('should not re-create a session that vanished mid-refresh', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      refreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash', userId: 1, sessionId: 'session-1', expiresAt
      } as RefreshToken);
      userSessionRepository.findOne.mockResolvedValue({
        userId: 1, sessionId: 'session-1', lastActivity: new Date(), expiresAt
      } as UserSession);
      userSessionRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });
      usersService.findOne.mockResolvedValue({ id: 1, name: 'user' } as User);
      jwtService.sign.mockReturnValue('new-atoken');

      await service.refreshAccessToken('valid-token');

      expect(userSessionRepository.upsert).not.toHaveBeenCalled();
    });

    it('should record the exchanged token before deleting it', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      refreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash', userId: 1, sessionId: 'session-1', expiresAt
      } as RefreshToken);
      userSessionRepository.findOne.mockResolvedValue({
        userId: 1, sessionId: 'session-1', lastActivity: new Date(), expiresAt
      } as UserSession);
      usersService.findOne.mockResolvedValue({ id: 1, name: 'user' } as User);
      jwtService.sign.mockReturnValue('new-atoken');
      const insertQuery = createMock<InsertQueryBuilder<UsedRefreshToken>>();
      insertQuery.values.mockReturnValue(insertQuery);
      insertQuery.orIgnore.mockReturnValue(insertQuery);
      const queryBuilder = createMock<SelectQueryBuilder<UsedRefreshToken>>();
      queryBuilder.insert.mockReturnValue(insertQuery);
      usedRefreshTokenRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.refreshAccessToken('valid-token');

      expect(insertQuery.values).toHaveBeenCalledWith({
        tokenHash: 'token-hash', userId: 1, sessionId: 'session-1', usedAt: expect.any(Date)
      });
      // Two refreshes in flight with the same token record the same hash.
      expect(insertQuery.orIgnore).toHaveBeenCalled();
      const recordOrder = insertQuery.execute.mock.invocationCallOrder[0];
      const deleteOrder = refreshTokenRepository.delete.mock.invocationCallOrder[0];
      expect(recordOrder).toBeLessThan(deleteOrder);
    });

    it('should return null if token not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      const result = await service.refreshAccessToken('invalid');
      expect(result).toBeNull();
      expect(userSessionRepository.delete).not.toHaveBeenCalled();
    });

    // Whoever used the token first got the new pair; which side is the copy cannot be told, so
    // both lose the session (#1935).
    it('should end the session when an exchanged token comes back after the grace period', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      usedRefreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash',
        userId: 1,
        sessionId: 'session-1',
        usedAt: new Date(1000000 - REFRESH_TOKEN_REUSE_GRACE_MS - 1000)
      } as UsedRefreshToken);

      const result = await service.refreshAccessToken('copied-token');

      expect(result).toBeNull();
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 1, sessionId: 'session-1' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 1, sessionId: 'session-1' });
    });

    // Within the grace period the second use is a second tab of the same browser that lost the race
    // for the refresh; it is refused as before, and the session goes on.
    it('should only refuse an exchanged token that comes back within the grace period', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      usedRefreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash',
        userId: 1,
        sessionId: 'session-1',
        usedAt: new Date(1000000 - REFRESH_TOKEN_REUSE_GRACE_MS + 1000)
      } as UsedRefreshToken);

      const result = await service.refreshAccessToken('raced-token');

      expect(result).toBeNull();
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(userSessionRepository.delete).not.toHaveBeenCalled();
    });

    // A session past its inactivity window, or deleted, cannot be resumed with a token that is still valid.
    it.each(['missing', 'expired'])('should refuse a token whose session is %s', async state => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const expired = new Date();
      expired.setMinutes(expired.getMinutes() - 10);
      refreshTokenRepository.findOne.mockResolvedValue({
        tokenHash: 'token-hash', userId: 1, sessionId: 'session-1', expiresAt
      } as RefreshToken);
      userSessionRepository.findOne.mockResolvedValue(state === 'missing' ? null : {
        userId: 1, sessionId: 'session-1', expiresAt: expired
      } as UserSession);

      const result = await service.refreshAccessToken('valid-token');

      expect(result).toBeNull();
      expect(refreshTokenRepository.save).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should return null if token is expired', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() - 10);
      refreshTokenRepository.findOne.mockResolvedValue({
        expiresAt,
        sessionId: 'session-1',
        userId: 1
      } as RefreshToken);

      const result = await service.refreshAccessToken('expired');
      expect(result).toBeNull();
    });
  });

  describe('initLogin', () => {
    it('should throw ForbiddenException if users exist', async () => {
      usersService.hasUsers.mockResolvedValue(true);
      await expect(service.initLogin('user', 'pass')).rejects.toThrow(ForbiddenException);
    });

    // Its session takes the id the client chose. After a lost answer and a reload, the next attempt
    // goes to the normal login and continues it (#2151).
    it('should create user and return token if no users exist', async () => {
      const chosenSid = '7c9e6679-7425-40de-944b-e07fc1f90ae7';
      usersService.hasUsers.mockResolvedValue(false);
      usersService.create.mockResolvedValue(1);
      jwtService.sign.mockReturnValue('access-token');
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);

      const result = await service.initLogin('user', 'pass', chosenSid);

      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: chosenSid }));

      expect(usersService.create).toHaveBeenCalledWith({
        name: 'user',
        password: 'pass',
        isAdmin: true,
        description: 'first initial user'
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(refreshTokenRepository.save).toHaveBeenCalled();
      expect(userSessionRepository.upsert).toHaveBeenCalled();
    });
  });

  describe('hasValidSession', () => {
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000);

    // A session opened anew under the id of an ended one is another row: the access tokens of the
    // ended one must not come back with it (#2115, #2151). A token without a row predates them.
    it.each([
      ['the row of the session', 42, true],
      ['the row of an ended session under the same id', 41, false],
      ['no row', undefined, true]
    ])('should judge a token naming %s', async (_, sessionRowId, expected) => {
      userSessionRepository.findOne.mockResolvedValue({
        id: 42, userId: 1, sessionId: 'session-1', expiresAt: inAnHour
      } as UserSession);

      expect(await service.hasValidSession(1, 'session-1', sessionRowId)).toBe(expected);
    });
  });

  describe('isAdminUser', () => {
    it('should return true if user is admin', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(true);
      expect(await service.isAdminUser(1)).toBe(true);
    });
    it('should return false if userId is falsy', async () => {
      expect(await service.isAdminUser(0)).toBe(false);
    });
  });

  describe('isWorkspaceGroupAdmin', () => {
    it('should return true if user is super admin', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(true);
      expect(await service.isWorkspaceGroupAdmin(1, 1)).toBe(true);
    });

    it('should return result from usersService if user is not super admin', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      usersService.isWorkspaceGroupAdmin.mockResolvedValue(true);
      expect(await service.isWorkspaceGroupAdmin(1, 1)).toBe(true);
      expect(usersService.isWorkspaceGroupAdmin).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('logout', () => {
    it('should delete all sessions and refresh tokens for the user', async () => {
      await service.logout(7);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 7 });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 7 });
    });
  });

  describe('logoutOrphanedSession', () => {
    // Orphaned means "no key left": the last interaction is older than the active phase,
    // so no access token can still be valid, and no unexpired refresh token remains. The
    // candidate query answers the first half, the token query the second.
    const candidateFound = (): void => {
      userSessionRepository.find.mockResolvedValue([{ sessionId: 'sid-7' }] as UserSession[]);
    };
    const noLiveToken = (): void => {
      refreshTokenRepository.find.mockResolvedValue([]);
    };
    const liveTokenFor = (sessionId: string): void => {
      refreshTokenRepository.find.mockResolvedValue([{ sessionId }] as RefreshToken[]);
    };

    it('should delete a session that has no unexpired refresh token left', async () => {
      candidateFound();
      noLiveToken();

      const result = await service.logoutOrphanedSession(7, 'sid-7');

      expect(result).toBe(true);
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
    });

    // The ordinary closed browser: nobody is working in it, but the refresh token still
    // opens it, so whoever comes back continues in this very session.
    it('should not delete a session a refresh token can still resume', async () => {
      candidateFound();
      liveTokenFor('sid-7');

      const result = await service.logoutOrphanedSession(7, 'sid-7');

      expect(result).toBe(false);
      expect(userSessionRepository.delete).not.toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
    });

    // Someone interacted moments ago, so an access token issued for this session can still
    // be valid -- whatever the token table says, this session is in use.
    it('should not delete a session that is still within its active phase', async () => {
      userSessionRepository.find.mockResolvedValue([]);
      noLiveToken();

      const result = await service.logoutOrphanedSession(7, 'sid-7');

      expect(result).toBe(false);
      expect(userSessionRepository.delete).not.toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
    });

    it('should ask only about the given session, unexpired and past its active phase', async () => {
      candidateFound();
      noLiveToken();

      await service.logoutOrphanedSession(7, 'sid-7');

      const now = new Date(Date.now());
      expect(userSessionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 7,
            sessionId: 'sid-7',
            expiresAt: MoreThan(now),
            lastActivity: LessThan(new Date(now.getTime() - ACTIVE_THRESHOLD_MS))
          })
        })
      );
      // The token query is keyed on the candidate ids alone: those are already this user's
      // sessions, and a sessionId belongs to exactly one of them.
      expect(refreshTokenRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sessionId: In(['sid-7']),
            expiresAt: MoreThan(now)
          })
        })
      );
    });
  });

  describe('deleteOrphanedSessions', () => {
    it('should delete every session of the user that no token can resume', async () => {
      userSessionRepository.find.mockResolvedValue([
        { sessionId: 'sid-1' }, { sessionId: 'sid-2' }
      ] as UserSession[]);
      refreshTokenRepository.find.mockResolvedValue([]);
      userSessionRepository.delete.mockResolvedValue({ affected: 2, raw: [] });

      const result = await service.deleteOrphanedSessions(7);

      expect(result).toBe(2);
      expect(userSessionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 7, expiresAt: expect.anything() })
        })
      );
    });

    // The one session of the batch that is still resumable has to survive the bulk delete.
    it('should spare the sessions a refresh token can still resume', async () => {
      userSessionRepository.find.mockResolvedValue([
        { sessionId: 'sid-1' }, { sessionId: 'sid-2' }
      ] as UserSession[]);
      refreshTokenRepository.find.mockResolvedValue([{ sessionId: 'sid-2' }] as RefreshToken[]);
      userSessionRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await service.deleteOrphanedSessions(7);

      expect(userSessionRepository.delete).toHaveBeenCalledWith({
        userId: 7,
        sessionId: In(['sid-1'])
      });
    });

    // Deleting by the condition again would spare a row that acquired a token between the
    // two statements, after its old tokens were already gone.
    it('should delete exactly the sessions it found rather than re-testing the condition', async () => {
      userSessionRepository.find.mockResolvedValue([
        { sessionId: 'sid-1' }, { sessionId: 'sid-2' }
      ] as UserSession[]);
      refreshTokenRepository.find.mockResolvedValue([]);
      userSessionRepository.delete.mockResolvedValue({ affected: 2, raw: [] });

      await service.deleteOrphanedSessions(7);

      expect(userSessionRepository.delete).toHaveBeenCalledWith({
        userId: 7,
        sessionId: In(['sid-1', 'sid-2'])
      });
    });

    it('should do nothing when the user has no orphaned sessions', async () => {
      userSessionRepository.find.mockResolvedValue([]);

      const result = await service.deleteOrphanedSessions(7);

      expect(result).toBe(0);
      expect(userSessionRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('logoutCurrentSession', () => {
    it('should delete the current session row', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        userId: 2,
        sessionId: 'sid-2'
      } as RefreshToken);

      await service.logoutCurrentSession('raw-refresh-token', 2, 'sid-2');

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 2, sessionId: 'sid-2' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 2, sessionId: 'sid-2' });
    });

    it('should fallback to session-scoped cleanup if token lookup fails and fallback session exists', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await service.logoutCurrentSession('missing-token', 9, 'sid-9');

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 9, sessionId: 'sid-9' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 9, sessionId: 'sid-9' });
    });

    it('should do nothing when token lookup fails without fallback session id', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await service.logoutCurrentSession('missing-token', 9);

      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(userSessionRepository.delete).not.toHaveBeenCalled();
    });

    // A tab reloaded while its refresh ran holds only the exchanged token and logs out with it (#2110).
    it('should end the session of a token that has already been exchanged', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      usedRefreshTokenRepository.findOne.mockResolvedValue({
        userId: 4,
        sessionId: 'sid-4',
        usedAt: new Date(Date.now())
      } as UsedRefreshToken);

      await service.logoutCurrentSession('exchanged-token');

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 4, sessionId: 'sid-4' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 4, sessionId: 'sid-4' });
    });
  });
});
