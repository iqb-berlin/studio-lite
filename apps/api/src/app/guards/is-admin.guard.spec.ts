import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { IsAdminGuard } from './is-admin.guard';
import { AuthService } from '../services/auth.service';

describe('IsAdminGuard', () => {
  let isAdminGuard: IsAdminGuard;
  let authService: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        }
      ]
    }).compile();
    authService = module.get(AuthService);
    isAdminGuard = new IsAdminGuard(authService);
  });

  it('should be defined', () => {
    expect(isAdminGuard).toBeDefined();
  });

  it('should return true if authService.isAdminUser returns true', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(true);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId }
        })
      })
    });

    expect(await isAdminGuard.canActivate(context)).toBe(true);
    expect(authService.isAdminUser).toHaveBeenCalledWith(userId);
  });

  it('should throw UnauthorizedException if authService.isAdminUser returns false', async () => {
    const userId = 1;
    authService.isAdminUser.mockResolvedValue(false);

    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: userId }
        })
      })
    });

    await expect(isAdminGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    expect(authService.isAdminUser).toHaveBeenCalledWith(userId);
  });
});
