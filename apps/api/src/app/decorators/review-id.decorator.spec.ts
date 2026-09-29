import { ExecutionContext } from '@nestjs/common';
import { reviewIdFromRequest } from './review-id.decorator';

describe('ReviewIdDecorator', () => {
  it('should return reviewId from request user', () => {
    const mockRequest = {
      user: {
        reviewId: 123
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = reviewIdFromRequest(null, mockExecutionContext);

    expect(result).toBe(123);
  });
});
