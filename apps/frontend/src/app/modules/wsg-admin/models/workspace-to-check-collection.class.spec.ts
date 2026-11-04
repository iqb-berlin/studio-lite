import { createMock } from '@golevelup/ts-jest';
import { UsersWorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceToCheckCollection } from './workspace-to-check-collection.class';

describe('WorkspaceToCheckCollection', () => {
  const workspace = (id: number, name: string, userAccessLevel = 0): UsersWorkspaceInListDto => (
    createMock<UsersWorkspaceInListDto>({ id, name, userAccessLevel })
  );

  const entry = (collection: WorkspaceToCheckCollection, id: number) => collection.entries
    .find(e => e.id === id)!;

  let collection: WorkspaceToCheckCollection;

  beforeEach(() => {
    collection = new WorkspaceToCheckCollection([workspace(1, 'alpha'), workspace(2, 'beta'), workspace(3, 'gamma')]);
  });

  it('should check the workspaces of the user at their access levels', () => {
    collection.setChecks([workspace(3, 'gamma', 4), workspace(1, 'alpha', 2)]);

    expect(collection.getChecks(7)).toEqual({
      groupId: 7,
      workspaces: [{ id: 1, accessLevel: 2 }, { id: 3, accessLevel: 4 }]
    });
  });

  it.each<[string, (c: WorkspaceToCheckCollection) => void, boolean]>([
    ['another workspace is checked', c => { entry(c, 2).isChecked = true; }, true],
    ['a workspace of the user is unchecked', c => { entry(c, 1).isChecked = false; }, true],
    ['the access level to a workspace changes', c => { entry(c, 1).accessLevel = 4; }, true],
    ['a workspace is unchecked and checked again at its level', c => {
      entry(c, 1).isChecked = false;
      entry(c, 1).isChecked = true;
    }, false]
  ])('should count it as a change when %s', (_, act, hasChanged) => {
    collection.setChecks([workspace(1, 'alpha', 2)]);

    act(collection);
    collection.updateHasChanged();

    expect(collection.hasChanged).toBe(hasChanged);
  });

  it('should compare with the saved checks and levels after saving', () => {
    collection.setChecks([workspace(1, 'alpha', 2)]);
    entry(collection, 1).accessLevel = 4;

    collection.setHasChangedFalse();
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(false);

    entry(collection, 1).accessLevel = 2;
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(true);
  });
});
