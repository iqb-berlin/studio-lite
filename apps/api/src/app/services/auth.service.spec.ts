import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { ReviewService } from './review.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: DeepMocked<UsersService>;
  let reviewService: DeepMocked<ReviewService>;
  let jwtService: DeepMocked<JwtService>;

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
        }
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    reviewService = module.get(ReviewService);
    jwtService = module.get(JwtService);
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
    it('should return signed token', async () => {
      jwtService.sign.mockReturnValue('token');
      const result = await service.login({ id: 1, name: 'user', reviewId: 0 });
      expect(result).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'user', sub: 1, sub2: 0 });
    });

    it('should return signed token for review', async () => {
      jwtService.sign.mockReturnValue('token');
      const result = await service.login({ id: 0, name: 'review', reviewId: 10 });
      expect(result).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'review', sub: 0, sub2: 10 });
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
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'user', sub: 1, sub2: 0 });
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
});
