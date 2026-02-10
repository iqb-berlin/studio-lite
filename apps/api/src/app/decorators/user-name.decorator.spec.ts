import { ExecutionContext } from '@nestjs/common';
import { UserName } from './user-name.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('UserNameDecorator', () => {
  it('should return name from request user', () => {
    const factory = UserName as unknown as (data: unknown, ctx: ExecutionContext) => string;

    const mockRequest = {
      user: {
        name: 'test-user'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe('test-user');
  });
});
