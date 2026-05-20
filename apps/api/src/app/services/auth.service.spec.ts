import { ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';
import User from '../entities/user.entity';
import { INACTIVITY_THRESHOLD_MS } from '../app.constants';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMocked<UsersService>;
  let reviewService: DeepMocked<ReviewService>;
  let jwtService: DeepMocked<JwtService>;
  let refreshTokenRepository: DeepMocked<Repository<RefreshToken>>;
  let userSessionRepository: DeepMocked<Repository<UserSession>>;

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
          provide: ConfigService,
          useValue: createMock<ConfigService>()
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    reviewService = module.get(ReviewService);
    jwtService = module.get(JwtService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
    userSessionRepository = module.get(getRepositoryToken(UserSession));
  });

  afterEach(() => {
    Date.now = realDateNow;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user id on success', async () => {
      usersService.getUserByNameAndPassword.mockResolvedValue(1);
      const result = await service.validateUser('user', 'pass');
      expect(result).toBe(1);
      expect(usersService.getUserByNameAndPassword).toHaveBeenCalledWith('user', 'pass');
    });
  });

  describe('validateReview', () => {
    it('should return review id on success', async () => {
      reviewService.getReviewByKeyAndPassword.mockResolvedValue(10);
      const result = await service.validateReview('key', 'pass');
      expect(result).toBe(10);
      expect(reviewService.getReviewByKeyAndPassword).toHaveBeenCalledWith('key', 'pass');
    });
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
      expect(userSessionRepository.save).toHaveBeenCalled();
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should reuse a session created within 200ms (simultaneous page-load requests)', async () => {
      const validSid = '550e8400-e29b-41d4-a716-446655440000';
      const recentSession = {
        sessionId: validSid,
        userId: 1,
        lastActivity: new Date(Date.now() - 100) // 100ms ago
      } as UserSession;
      userSessionRepository.findOne.mockResolvedValue(recentSession);
      userSessionRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      jwtService.sign.mockReturnValue('reused-token');

      await service.login({ id: 1, name: 'user', reviewId: 0 });

      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ sid: validSid }));
      expect(userSessionRepository.update).toHaveBeenCalledWith(
        { userId: 1, sessionId: validSid },
        expect.any(Object)
      );
      expect(userSessionRepository.save).not.toHaveBeenCalled();
    });

    it('should create a new session if no sessionId is provided and last session is older than 200ms', async () => {
      const recentSession = {
        sessionId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 1,
        lastActivity: new Date(Date.now() - 500) // 500ms ago — outside threshold
      } as UserSession;
      userSessionRepository.findOne.mockResolvedValue(recentSession);
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);
      jwtService.sign.mockReturnValue('new-token');

      await service.login({ id: 1, name: 'user', reviewId: 0 });

      expect(userSessionRepository.save).toHaveBeenCalled();
      expect(userSessionRepository.update).not.toHaveBeenCalledWith(
        { userId: 1, sessionId: recentSession.sessionId },
        expect.any(Object)
      );
    });

    it('should reuse the provided existingSessionId', async () => {
      const validSid = '550e8400-e29b-41d4-a716-446655440000';
      jwtService.sign.mockReturnValue('reused-token');
      userSessionRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await service.login({ id: 1, name: 'user', reviewId: 0 }, validSid);

      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({
        sid: validSid
      }));
      expect(userSessionRepository.update).toHaveBeenCalledWith(
        { userId: 1, sessionId: validSid },
        expect.any(Object)
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new tokens if refresh token is valid', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const mockToken = {
        tokenHash: 'token-hash',
        userId: 1,
        sessionId: 'session-1',
        expiresAt
      } as RefreshToken;
      const session = {
        userId: 1,
        sessionId: 'session-1',
        lastActivity: new Date(),
        expiresAt
      } as UserSession;

      refreshTokenRepository.findOne.mockResolvedValue(mockToken);
      userSessionRepository.findOne.mockResolvedValue(session);
      usersService.findOne.mockResolvedValue({ id: 1, name: 'user' } as User);
      jwtService.sign.mockReturnValue('new-atoken');

      const result = await service.refreshAccessToken('valid-token');

      expect(result?.accessToken).toBe('new-atoken');
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ tokenHash: 'token-hash' });
    });

    it('should return null if token not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);
      const result = await service.refreshAccessToken('invalid');
      expect(result).toBeNull();
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

    it('should create user and return token if no users exist', async () => {
      usersService.hasUsers.mockResolvedValue(false);
      usersService.create.mockResolvedValue(1);
      jwtService.sign.mockReturnValue('access-token');
      refreshTokenRepository.create.mockReturnValue({} as RefreshToken);
      refreshTokenRepository.save.mockResolvedValue({} as RefreshToken);
      userSessionRepository.create.mockReturnValue({} as UserSession);
      userSessionRepository.save.mockResolvedValue({} as UserSession);

      const result = await service.initLogin('user', 'pass');

      expect(usersService.create).toHaveBeenCalledWith({
        name: 'user',
        password: 'pass',
        isAdmin: true,
        description: 'first initial user'
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
      expect(refreshTokenRepository.save).toHaveBeenCalled();
      expect(userSessionRepository.save).toHaveBeenCalled();
    });
  });

  describe('isAdminUser', () => {
    it('should return true if user is admin', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(true);
      expect(await service.isAdminUser(1)).toBe(true);
    });
    it('should return false if user is not admin', async () => {
      usersService.getUserIsAdmin.mockResolvedValue(false);
      expect(await service.isAdminUser(1)).toBe(false);
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

  describe('canAccessWorkSpace', () => {
    it('should delegate to usersService', async () => {
      usersService.canAccessWorkSpace.mockResolvedValue(true);
      const result = await service.canAccessWorkSpace(1, 1);
      expect(result).toBe(true);
      expect(usersService.canAccessWorkSpace).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('logout', () => {
    it('should delete all sessions and refresh tokens for the user', async () => {
      await service.logout(7);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 7 });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 7 });
    });
  });

  describe('logoutSession', () => {
    it('should delete the targeted session and its refresh tokens', async () => {
      await service.logoutSession(7, 'session-7');

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'session-7' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'session-7' });
    });
  });

  describe('logoutOrphanedSession', () => {
    it('should delete an orphaned session', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const lastActivity = new Date(Date.now() - INACTIVITY_THRESHOLD_MS - 1000);
      userSessionRepository.findOne.mockResolvedValue({
        userId: 7, sessionId: 'sid-7', expiresAt, lastActivity
      } as UserSession);

      const result = await service.logoutOrphanedSession(7, 'sid-7');

      expect(result).toBe(true);
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
    });

    it('should not delete a non-orphaned session', async () => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      const lastActivity = new Date();
      userSessionRepository.findOne.mockResolvedValue({
        userId: 7, sessionId: 'sid-7', expiresAt, lastActivity
      } as UserSession);

      const result = await service.logoutOrphanedSession(7, 'sid-7');

      expect(result).toBe(false);
      expect(userSessionRepository.delete).not.toHaveBeenCalledWith({ userId: 7, sessionId: 'sid-7' });
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
  });
});
