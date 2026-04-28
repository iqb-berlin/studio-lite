import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { ChangePasswordDto, MyDataDto } from '@studio-lite-lib/api-dto';
import { AppController } from './app.controller';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { WorkspaceService } from '../services/workspace.service';
import { ReviewService } from '../services/review.service';
import UserEntity from '../entities/user.entity';
import Review from '../entities/review.entity';

describe('AppController', () => {
  let controller: AppController;
  let authService: DeepMocked<AuthService>;
  let usersService: DeepMocked<UsersService>;
  let workspaceService: DeepMocked<WorkspaceService>;
  let reviewService: DeepMocked<ReviewService>;

  beforeEach(async () => {
    authService = createMock<AuthService>();
    usersService = createMock<UsersService>();
    workspaceService = createMock<WorkspaceService>();
    reviewService = createMock<ReviewService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: 'APP_VERSION', useValue: '0.0.0' },
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: WorkspaceService, useValue: workspaceService },
        { provide: ReviewService, useValue: reviewService }
      ]
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token', async () => {
      const mockUser = { id: 1, name: 'test' } as UserEntity;
      const mockTokens = { accessToken: 'mock-atoken', refreshToken: 'mock-rtoken' };
      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login({ user: mockUser });

      expect(result).toBe(mockTokens);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('initLogin', () => {
    it('should return tokens for first login', async () => {
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
      authService.initLogin.mockResolvedValue(mockTokens);

      const result = await controller.initLogin({ username: 'user', password: 'pass' });

      expect(result).toEqual(mockTokens);
      expect(authService.initLogin).toHaveBeenCalledWith('user', 'pass');
    });
  });

  describe('logout', () => {
    it('should call logoutCurrentSession when refresh token is provided', async () => {
      await controller.logout({ user: { sessionId: 'sid-3' } }, 3, { refreshToken: 'rt-3' });

      expect(authService.logoutCurrentSession).toHaveBeenCalledWith('rt-3', 3, 'sid-3');
      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should call global logout when no refresh token is provided', async () => {
      await controller.logout({ user: { sessionId: 'sid-4' } }, 4, {});

      expect(authService.logout).toHaveBeenCalledWith(4);
      expect(authService.logoutCurrentSession).not.toHaveBeenCalled();
    });
  });

  describe('logoutSilent', () => {
    it('should call logoutCurrentSession when refresh token is provided', async () => {
      await controller.logoutSilent({ refreshToken: 'rt-silent' });

      expect(authService.logoutCurrentSession).toHaveBeenCalledWith('rt-silent');
    });

    it('should do nothing when refresh token is missing', async () => {
      await controller.logoutSilent({});

      expect(authService.logoutCurrentSession).not.toHaveBeenCalled();
    });
  });

  describe('ping', () => {
    it('should extend the current session expiry', async () => {
      usersService.updateSessionExpiry.mockResolvedValue(undefined);

      await controller.ping({ user: { id: 1, sessionId: 'sid-1' } });

      expect(usersService.updateSessionExpiry).toHaveBeenCalledWith(1, 'sid-1');
    });
  });

  describe('activity', () => {
    it('should update the current session activity', async () => {
      usersService.updateLastActivity.mockResolvedValue(undefined);

      await controller.activity({ user: { id: 1, sessionId: 'sid-1' } });

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
    });
  });

  describe('findCanDos', () => {
    it('should return auth data for a user', async () => {
      usersService.getLongName.mockResolvedValue('Long Name');
      authService.isAdminUser.mockResolvedValue(true);
      workspaceService.findAllGroupwise.mockResolvedValue([]);
      reviewService.findAllByUser.mockResolvedValue([]);

      const result = await controller.findCanDos(1, 'test', 0);

      expect(result).toEqual({
        userId: 1,
        userName: 'test',
        userLongName: 'Long Name',
        isAdmin: true,
        workspaces: [],
        reviews: []
      });
    });

    it('should return review auth data for reviewId if userId is 0', async () => {
      const mockReview = { id: 1, name: 'review' } as Review;
      reviewService.findOneForAuth.mockResolvedValue(mockReview);

      const result = await controller.findCanDos(0, '', 1);

      expect(result).toEqual({
        userId: 0,
        userName: '',
        isAdmin: false,
        workspaces: [],
        reviews: [mockReview]
      });
    });
  });

  describe('setPassword', () => {
    it('should call userService.setPassword', async () => {
      const dto: ChangePasswordDto = { oldPassword: 'old', newPassword: 'new' };
      usersService.setPassword.mockResolvedValue(true);

      const result = await controller.setPassword({ user: { id: 1 } }, dto);

      expect(result).toBe(true);
      expect(usersService.setPassword).toHaveBeenCalledWith(1, 'old', 'new');
    });
  });

  describe('findMydata', () => {
    it('should return my data', async () => {
      const mockUser = {
        id: 1,
        lastName: 'Last',
        firstName: 'First',
        email: 'test@email.com',
        emailPublishApproved: true,
        description: 'desc'
      } as UserEntity;
      usersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findMydata(1);

      expect(result).toEqual({
        id: 1,
        lastName: 'Last',
        firstName: 'First',
        email: 'test@email.com',
        emailPublishApproved: true,
        description: 'desc'
      });
    });
  });

  describe('setMyData', () => {
    it('should update my data if IDs match', async () => {
      const dto: MyDataDto = { id: 1, lastName: 'New' } as MyDataDto;
      usersService.patchMyData.mockResolvedValue(undefined);

      const result = await controller.setMyData({ user: { id: 1 } }, dto);

      expect(result).toBe(true);
      expect(usersService.patchMyData).toHaveBeenCalledWith(dto);
    });

    it('should throw UnauthorizedException if IDs do not match', async () => {
      const dto: MyDataDto = { id: 2, lastName: 'New' } as MyDataDto;

      await expect(controller.setMyData({ user: { id: 1 } }, dto))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
