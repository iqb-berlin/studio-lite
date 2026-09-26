import { ExecutionContext } from '@nestjs/common';
import { userIdFromRequest } from './user-id.decorator';

describe('UserIdDecorator', () => {
  it('should return id from request user', () => {
    const mockRequest = {
      user: {
        id: 1
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = userIdFromRequest(null, mockExecutionContext);

    expect(result).toBe(1);
  });
});
