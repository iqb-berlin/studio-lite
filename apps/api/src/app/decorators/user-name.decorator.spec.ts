import { ExecutionContext } from '@nestjs/common';
import { userNameFromRequest } from './user-name.decorator';

describe('UserNameDecorator', () => {
  it('should return name from request user', () => {
    const mockRequest = {
      user: {
        name: 'test-user'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = userNameFromRequest(null, mockExecutionContext);

    expect(result).toBe('test-user');
  });
});
