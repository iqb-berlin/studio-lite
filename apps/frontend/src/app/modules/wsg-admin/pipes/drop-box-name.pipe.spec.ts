import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { DropBoxNamePipe } from './drop-box-name.pipe';

const createWorkspace = (overrides: Partial<WorkspaceInListDto> = {}): WorkspaceInListDto => ({
  id: 1,
  name: 'Workspace A',
  groupId: 10,
  dropBoxId: 0,
  unitsCount: 3,
  ...overrides
});

describe('DropBoxNamePipe', () => {
  const pipe = new DropBoxNamePipe();
  const workspaces = [
    createWorkspace({ id: 1, name: 'Alpha', dropBoxId: 2 }),
    createWorkspace({ id: 2, name: 'Beta' })
  ];

  it('gives the name of the drop box', () => {
    expect(pipe.transform(2, 1, workspaces)).toBe('Beta');
  });

  it('gives nothing when no drop box is set', () => {
    expect(pipe.transform(undefined, 1, workspaces)).toBe('');
    expect(pipe.transform(null, 1, workspaces)).toBe('');
  });

  it('gives nothing for a drop box that is not in the group, such as a deleted workspace (#2251)', () => {
    expect(pipe.transform(999, 1, workspaces)).toBe('');
  });

  it('gives nothing when the workspace is set as its own drop box (#2251)', () => {
    expect(pipe.transform(1, 1, workspaces)).toBe('');
  });
});
