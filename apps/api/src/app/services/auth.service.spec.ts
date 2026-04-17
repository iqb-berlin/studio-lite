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

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMocked<UsersService>;
  let reviewService: DeepMocked<ReviewService>;
  let jwtService: DeepMocked<JwtService>;
  let refreshTokenRepository: DeepMocked<Repository<RefreshToken>>;
  let userSessionRepository: DeepMocked<Repository<UserSession>>;

  beforeEach(async () => {
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
      jwtService.sign.mockReturnValue('token');

      const result = await service.initLogin('user', 'pass');

      expect(usersService.create).toHaveBeenCalledWith({
        name: 'user',
        password: 'pass',
        isAdmin: true,
        description: 'first initial user'
      });
      expect(result).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith(expect.objectContaining({ username: 'user', sub: 1, sub2: 0 }));
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

  describe('logoutCurrentSession', () => {
    it('should delete the current session and its refresh tokens', async () => {
      refreshTokenRepository.findOne.mockResolvedValue({
        userId: 2,
        sessionId: 'sid-2'
      } as RefreshToken);

      await service.logoutCurrentSession('raw-refresh-token', 2);

      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 2, sessionId: 'sid-2' });
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 2, sessionId: 'sid-2' });
    });

    it('should fallback to full logout if token lookup fails and fallback user exists', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await service.logoutCurrentSession('missing-token', 9);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({ userId: 9 });
      expect(userSessionRepository.delete).toHaveBeenCalledWith({ userId: 9 });
    });
  });
});
