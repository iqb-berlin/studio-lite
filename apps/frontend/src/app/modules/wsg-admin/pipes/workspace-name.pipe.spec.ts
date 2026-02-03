import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceNamePipe } from './workspace-name.pipe';

const createWorkspace = (overrides: Partial<WorkspaceInListDto> = {}): WorkspaceInListDto => ({
  id: 1,
  name: 'Workspace A',
  groupId: 10,
  dropBoxId: 20,
  unitsCount: 3,
  ...overrides
});

describe('WorkspaceNamePipe', () => {
  it('returns the matching workspace name for the given id', () => {
    const pipe = new WorkspaceNamePipe();
    const workspaces = [
      createWorkspace({ id: 1, name: 'Alpha' }),
      createWorkspace({ id: 2, name: 'Beta' })
    ];

    expect(pipe.transform(2, workspaces)).toBe('Beta');
  });

  it('returns an empty string when no workspace matches', () => {
    const pipe = new WorkspaceNamePipe();
    const workspaces = [createWorkspace({ id: 1, name: 'Alpha' })];

    expect(pipe.transform(999, workspaces)).toBe('');
  });

  it('returns an empty string when the workspace list is empty', () => {
    const pipe = new WorkspaceNamePipe();

    expect(pipe.transform(1, [])).toBe('');
  });
});
