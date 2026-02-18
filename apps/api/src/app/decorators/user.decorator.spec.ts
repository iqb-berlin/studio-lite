import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import UserEntity from '../entities/user.entity';
import { User } from './user.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('UserDecorator', () => {
  it('should return the user from the request', () => {
    // With the mock above, User is now the factory function
    const factory = User as unknown as (data: unknown, ctx: ExecutionContext) => UserEntity;

    const mockUser: Partial<UserEntity> = {
      id: 1,
      name: 'testuser'
    };

    const mockRequest = {
      user: mockUser
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe(mockUser);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
  });

  it('should have called createParamDecorator', () => {
    expect(createParamDecorator).toHaveBeenCalled();
  });
});
