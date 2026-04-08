import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AppVersionGuard } from './app-version.guard';

describe('AppVersionGuard', () => {
  let guard: AppVersionGuard;
  const appVersion = '15.0.0';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: appVersion
        },
        AppVersionGuard
      ]
    }).compile();

    guard = module.get<AppVersionGuard>(AppVersionGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if app-version header matches', async () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'app-version': appVersion
          }
        })
      })
    });

    expect(await guard.canActivate(context)).toBe(true);
  });

  it('should throw HttpException with status 521 if app-version header does not match', async () => {
    const headerVersion = '1.0.0';
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'app-version': headerVersion
          }
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new HttpException(
        `Unexpected app version: ${headerVersion} - must be ${appVersion}`,
        521
      )
    );
  });

  it('should throw HttpException with status 521 if app-version header is missing', async () => {
    const context = createMock<ExecutionContext>({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {}
        })
      })
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new HttpException(
        `Unexpected app version: undefined - must be ${appVersion}`,
        521
      )
    );
  });
});
