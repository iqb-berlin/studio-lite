import { WorkspaceDto } from '@studio-lite-lib/api-dto';
import { UserIssuesPipe } from './user-issues.pipe';

describe('UserIssuesPipe', () => {
  let pipe: UserIssuesPipe;

  beforeEach(() => {
    pipe = new UserIssuesPipe();
  });

  it('should transform workspace DTOs to user issues with correct link and name', () => {
    const workspaces: WorkspaceDto[] = [
      { id: 1, name: 'Workspace 1' } as WorkspaceDto,
      { id: 2, name: 'Workspace 2' } as WorkspaceDto
    ];
    const linkPrefix = 'workspace';
    const result = pipe.transform(workspaces, linkPrefix);

    expect(result).toEqual([
      { link: '/workspace/1', name: 'Workspace 1' },
      { link: '/workspace/2', name: 'Workspace 2' }
    ]);
  });

  it('should return undefined when issues is undefined', () => {
    const result = pipe.transform(undefined!, 'workspace');
    expect(result).toBeUndefined();
  });
});
