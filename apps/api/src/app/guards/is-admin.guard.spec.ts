import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { IsAdminGuard } from './is-admin.guard';
import { AuthService } from '../service/auth.service';

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
});
