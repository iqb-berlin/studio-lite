import { WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceUserToCheckCollection } from './workspace-users-to-check-collection.class';

describe('WorkspaceUserToCheckCollection', () => {
  const user = (id: number, name: string, workspaceAccessLevel = 0): WorkspaceUserInListDto => ({
    id, name, isAdmin: false, workspaceAccessLevel
  });

  const entry = (collection: WorkspaceUserToCheckCollection, id: number) => collection.entries
    .find(e => e.id === id)!;

  let collection: WorkspaceUserToCheckCollection;

  beforeEach(() => {
    collection = new WorkspaceUserToCheckCollection([user(1, 'anna'), user(2, 'bert'), user(3, 'carl')]);
  });

  it('should check the users of the workspace at their access levels', () => {
    collection.setChecks([user(3, 'carl', 4), user(1, 'anna', 2)]);

    expect(collection.getChecks()).toEqual([{ id: 1, accessLevel: 2 }, { id: 3, accessLevel: 4 }]);
  });

  it.each<[string, (c: WorkspaceUserToCheckCollection) => void, boolean]>([
    ['another user is checked', c => { entry(c, 2).isChecked = true; }, true],
    ['a user of the workspace is unchecked', c => { entry(c, 1).isChecked = false; }, true],
    ['the access level of a user changes', c => { entry(c, 1).accessLevel = 4; }, true],
    ['a user is unchecked and checked again at their level', c => {
      entry(c, 1).isChecked = false;
      entry(c, 1).isChecked = true;
    }, false]
  ])('should count it as a change when %s', (_, act, hasChanged) => {
    collection.setChecks([user(1, 'anna', 2)]);

    act(collection);
    collection.updateHasChanged();

    expect(collection.hasChanged).toBe(hasChanged);
  });

  it('should compare with the saved checks and levels after saving', () => {
    collection.setChecks([user(1, 'anna', 2)]);
    entry(collection, 1).accessLevel = 4;

    collection.setHasChangedFalse();
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(false);

    entry(collection, 1).accessLevel = 2;
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(true);
  });
});
