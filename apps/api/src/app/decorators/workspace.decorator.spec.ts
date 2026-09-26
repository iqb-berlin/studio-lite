import { ExecutionContext } from '@nestjs/common';
import { workspaceIdFromRequest } from './workspace.decorator';

describe('WorkspaceIdDecorator', () => {
  it('should return workspace_id from request params', () => {
    const mockRequest = {
      params: {
        workspace_id: 'test-ws'
      }
    };

    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnThis(),
      getRequest: jest.fn().mockReturnValue(mockRequest)
    } as unknown as ExecutionContext;

    const result = workspaceIdFromRequest(null, mockExecutionContext);

    expect(result).toBe('test-ws');
  });
});
