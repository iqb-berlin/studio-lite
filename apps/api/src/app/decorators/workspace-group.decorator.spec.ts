import { ExecutionContext } from '@nestjs/common';
import { workspaceGroupIdFromRequest } from './workspace-group.decorator';

describe('WorkspaceGroupIdDecorator', () => {
  it('should return workspace_group_id as integer from request params', () => {
    const mockRequest = {
      params: {
        workspace_group_id: '123'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = workspaceGroupIdFromRequest(null, mockExecutionContext);

    expect(result).toBe(123);
  });
});
