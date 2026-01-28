import { WorkspaceDto } from '@studio-lite-lib/api-dto';
import { UserIssuesPipe } from './user-issues.pipe';

describe('UserIssuesPipe', () => {
  let pipe: UserIssuesPipe;

  beforeEach(() => {
    pipe = new UserIssuesPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
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

  it('should handle empty array', () => {
    const workspaces: WorkspaceDto[] = [];
    const linkPrefix = 'workspace';
    const result = pipe.transform(workspaces, linkPrefix);

    expect(result).toEqual([]);
  });

  it('should handle different link prefixes', () => {
    const workspaces: WorkspaceDto[] = [
      { id: 5, name: 'Test Workspace' } as WorkspaceDto
    ];
    const linkPrefix = 'admin/workspace';
    const result = pipe.transform(workspaces, linkPrefix);

    expect(result).toEqual([
      { link: '/admin/workspace/5', name: 'Test Workspace' }
    ]);
  });

  it('should handle single workspace', () => {
    const workspaces: WorkspaceDto[] = [
      { id: 10, name: 'Single Workspace' } as WorkspaceDto
    ];
    const linkPrefix = 'project';
    const result = pipe.transform(workspaces, linkPrefix);

    expect(result).toEqual([
      { link: '/project/10', name: 'Single Workspace' }
    ]);
  });

  it('should handle multiple workspaces', () => {
    const workspaces: WorkspaceDto[] = [
      { id: 1, name: 'First' } as WorkspaceDto,
      { id: 2, name: 'Second' } as WorkspaceDto,
      { id: 3, name: 'Third' } as WorkspaceDto
    ];
    const linkPrefix = 'issues';
    const result = pipe.transform(workspaces, linkPrefix);

    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ link: '/issues/1', name: 'First' });
    expect(result[1]).toEqual({ link: '/issues/2', name: 'Second' });
    expect(result[2]).toEqual({ link: '/issues/3', name: 'Third' });
  });

  it('should return undefined when issues is undefined', () => {
    const result = pipe.transform(undefined!, 'workspace');
    expect(result).toBeUndefined();
  });

  it('should return undefined when issues is null', () => {
    const result = pipe.transform(null!, 'workspace');
    expect(result).toBeUndefined();
  });
});
