import { ExecutionContext } from '@nestjs/common';
import { UserId } from './user-id.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('UserIdDecorator', () => {
  it('should return id from request user', () => {
    const factory = UserId as unknown as (data: unknown, ctx: ExecutionContext) => number;

    const mockRequest = {
      user: {
        id: 1
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe(1);
  });
});
