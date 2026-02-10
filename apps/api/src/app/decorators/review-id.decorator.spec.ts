import { ExecutionContext } from '@nestjs/common';
import { ReviewId } from './review-id.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('ReviewIdDecorator', () => {
  it('should return reviewId from request user', () => {
    const factory = ReviewId as unknown as (data: unknown, ctx: ExecutionContext) => number;

    const mockRequest = {
      user: {
        reviewId: 123
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe(123);
  });
});
