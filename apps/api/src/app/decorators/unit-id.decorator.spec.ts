import { ExecutionContext } from '@nestjs/common';
import { unitIdFromRequest } from './unit-id.decorator';

describe('UnitIdDecorator', () => {
  it('should return unit_id from request params', () => {
    const mockRequest = {
      params: {
        unit_id: 'test-unit'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = unitIdFromRequest(null, mockExecutionContext);

    expect(result).toBe('test-unit');
  });
});
