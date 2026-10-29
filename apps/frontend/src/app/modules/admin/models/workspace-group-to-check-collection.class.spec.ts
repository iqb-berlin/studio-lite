import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceGroupToCheckCollection } from './workspace-group-to-check-collection.class';

describe('WorkspaceGroupToCheckCollection', () => {
  const group = (id: number, name: string): WorkspaceGroupInListDto => ({ id, name });
  const alpha = group(1, 'alpha');
  const beta = group(2, 'beta');
  const gamma = group(3, 'gamma');

  const entry = (collection: WorkspaceGroupToCheckCollection, id: number) => collection.entries
    .find(e => e.id === id)!;

  let collection: WorkspaceGroupToCheckCollection;

  beforeEach(() => {
    collection = new WorkspaceGroupToCheckCollection([alpha, beta, gamma]);
  });

  it('should check the groups the user administers', () => {
    collection.setChecks([gamma, alpha]);

    expect(collection.getChecks()).toEqual([1, 3]);
  });

  it.each<[string, (c: WorkspaceGroupToCheckCollection) => void, boolean]>([
    ['another group is checked', c => { entry(c, 2).isChecked = true; }, true],
    ['an administered group is unchecked', c => { entry(c, 1).isChecked = false; }, true],
    ['an administered group is unchecked and checked again', c => {
      entry(c, 1).isChecked = false;
      entry(c, 1).isChecked = true;
    }, false]
  ])('should count it as a change when %s', (_, act, hasChanged) => {
    collection.setChecks([alpha]);

    act(collection);
    collection.updateHasChanged();

    expect(collection.hasChanged).toBe(hasChanged);
  });

  it('should compare with the saved checks after saving', () => {
    collection.setChecks([alpha]);
    entry(collection, 2).isChecked = true;

    collection.setHasChangedFalse();
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(false);

    entry(collection, 2).isChecked = false;
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(true);
  });
});
