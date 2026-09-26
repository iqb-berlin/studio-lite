import { ExecutionContext } from '@nestjs/common';
import { itemUuidFromRequest } from './item-uuid.decorator';

describe('ItemUuidDecorator', () => {
  it('should return item_uuid from request params', () => {
    const mockRequest = {
      params: {
        item_uuid: 'test-uuid'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = itemUuidFromRequest(null, mockExecutionContext);

    expect(result).toBe('test-uuid');
  });
});
