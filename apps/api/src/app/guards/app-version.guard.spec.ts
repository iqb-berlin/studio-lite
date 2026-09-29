import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import packageJson from '../../../../../package.json';
import { AppVersionGuard, AppVersionProvider } from './app-version.guard';

describe('AppVersionGuard', () => {
  let guard: AppVersionGuard;
  // Taken from the provider instead of a literal of its own, which once kept an old number for a
  // whole release (#1643).
  const appVersion = AppVersionProvider.useValue;

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

  // The guard compares against the release version in package.json -- the value the frontend
  // sends, and nothing to raise here at a release (#1643).
  it('should be provided the version from package.json', () => {
    expect(AppVersionProvider).toEqual({ provide: 'APP_VERSION', useValue: packageJson.version });
    expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
  });
});
