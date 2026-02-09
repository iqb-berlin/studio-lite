import { ExecutionContext } from '@nestjs/common';
import { WorkspaceId } from './workspace.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('WorkspaceIdDecorator', () => {
  it('should return workspace_id from request params', () => {
    const factory = WorkspaceId as unknown as (data: unknown, ctx: ExecutionContext) => string;

    const mockRequest = {
      params: {
        workspace_id: 'test-ws'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = factory(null, mockExecutionContext);

    expect(result).toBe('test-ws');
  });
});
