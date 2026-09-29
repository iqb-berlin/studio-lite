import { ExecutionContext } from '@nestjs/common';
import UserEntity from '../entities/user.entity';
import { User, userFromRequest } from './user.decorator';

describe('UserDecorator', () => {
  it('should return the user from the request', () => {
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

    const result = userFromRequest(null, mockExecutionContext);

    expect(result).toBe(mockUser);
    expect(mockExecutionContext.switchToHttp).toHaveBeenCalled();
  });

  it('should expose the factory as a parameter decorator', () => {
    expect(typeof User).toBe('function');
  });
});
