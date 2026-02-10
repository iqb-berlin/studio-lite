import { ExecutionContext } from '@nestjs/common';
import { ItemUuid } from './item-uuid.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('ItemUuidDecorator', () => {
  it('should return item_uuid from request params', () => {
    const factory = ItemUuid as unknown as (data: unknown, ctx: ExecutionContext) => string;

    const mockRequest = {
      params: {
        item_uuid: 'test-uuid'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe('test-uuid');
  });
});
