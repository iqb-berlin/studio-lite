import { ExecutionContext } from '@nestjs/common';
import { WorkspaceGroupId } from './workspace-group.decorator';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  createParamDecorator: jest.fn(factory => factory)
}));

describe('WorkspaceGroupIdDecorator', () => {
  it('should return workspace_group_id as integer from request params', () => {
    const factory = WorkspaceGroupId as unknown as (data: unknown, ctx: ExecutionContext) => number;

    const mockRequest = {
      params: {
        workspace_group_id: '123'
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
