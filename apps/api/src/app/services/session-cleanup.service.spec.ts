import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionCleanupService } from './session-cleanup.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import UserSession from '../entities/user-session.entity';

describe('SessionCleanupService', () => {
  let service: SessionCleanupService;
  let userSessionRepository: DeepMocked<Repository<UserSession>>;
  let refreshTokenRepository: DeepMocked<Repository<RefreshToken>>;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // The swallowed cleanup errors below are expected; without this the suite
    // prints them to stderr and a green CI run looks like a failed one.
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionCleanupService,
        {
          provide: getRepositoryToken(UserSession),
          useValue: createMock<Repository<UserSession>>()
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: createMock<Repository<RefreshToken>>()
        }
      ]
    }).compile();

    service = module.get<SessionCleanupService>(SessionCleanupService);
    userSessionRepository = module.get(getRepositoryToken(UserSession));
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupExpiredRows', () => {
    it('should delete expired sessions and refresh tokens', async () => {
      jest.useFakeTimers().setSystemTime(1000000);
      userSessionRepository.delete.mockResolvedValue({ affected: 2, raw: [] });
      refreshTokenRepository.delete.mockResolvedValue({ affected: 3, raw: [] });

      await service.cleanupExpiredRows();

      expect(userSessionRepository.delete)
        .toHaveBeenCalledWith({ expiresAt: LessThan(new Date(1000000)) });
      expect(refreshTokenRepository.delete)
        .toHaveBeenCalledWith({ expiresAt: LessThan(new Date(1000000)) });
    });

    it('should not throw when the session delete fails', async () => {
      userSessionRepository.delete.mockRejectedValue(new Error('db down'));

      await expect(service.cleanupExpiredRows()).resolves.toBeUndefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Cleanup of expired sessions failed.',
        expect.stringContaining('db down')
      );
    });

    it('should not throw when the refresh token delete fails', async () => {
      userSessionRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      refreshTokenRepository.delete.mockRejectedValue(new Error('db down'));

      await expect(service.cleanupExpiredRows()).resolves.toBeUndefined();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Cleanup of expired sessions failed.',
        expect.stringContaining('db down')
      );
    });
  });

  describe('onApplicationBootstrap', () => {
    it('should run a catch-up cleanup on startup', async () => {
      userSessionRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      refreshTokenRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await service.onApplicationBootstrap();

      expect(userSessionRepository.delete).toHaveBeenCalled();
      expect(refreshTokenRepository.delete).toHaveBeenCalled();
    });
  });

  describe('handleScheduledCleanup', () => {
    it('should run the cleanup', async () => {
      userSessionRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      refreshTokenRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await service.handleScheduledCleanup();

      expect(userSessionRepository.delete).toHaveBeenCalled();
      expect(refreshTokenRepository.delete).toHaveBeenCalled();
    });
  });
});
