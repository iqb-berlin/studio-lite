import { ExecutionContext } from '@nestjs/common';
import { UnitId } from './unit-id.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('UnitIdDecorator', () => {
  it('should return unit_id from request params', () => {
    const factory = UnitId as unknown as (data: unknown, ctx: ExecutionContext) => string;

    const mockRequest = {
      params: {
        unit_id: 'test-unit'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe('test-unit');
  });
});
