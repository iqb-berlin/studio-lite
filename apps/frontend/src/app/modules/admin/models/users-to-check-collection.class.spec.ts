import { UserInListDto } from '@studio-lite-lib/api-dto';
import { UserToCheckCollection } from './users-to-check-collection.class';

describe('UserToCheckCollection', () => {
  const user = (id: number, name: string): UserInListDto => ({ id, name, isAdmin: false });
  const anna = user(1, 'anna');
  const bert = user(2, 'bert');
  const carl = user(3, 'carl');

  const entry = (collection: UserToCheckCollection, id: number) => collection.entries
    .find(e => e.id === id)!;

  let collection: UserToCheckCollection;

  beforeEach(() => {
    collection = new UserToCheckCollection([anna, bert, carl]);
  });

  it('should check the admins of the group', () => {
    collection.setChecks([carl, anna]);

    expect(collection.getChecks()).toEqual([1, 3]);
  });

  it.each<[string, (c: UserToCheckCollection) => void, boolean]>([
    ['another user is checked', c => { entry(c, 2).isChecked = true; }, true],
    ['an admin is unchecked', c => { entry(c, 1).isChecked = false; }, true],
    ['an admin is unchecked and checked again', c => {
      entry(c, 1).isChecked = false;
      entry(c, 1).isChecked = true;
    }, false]
  ])('should count it as a change when %s', (_, act, hasChanged) => {
    collection.setChecks([anna]);

    act(collection);
    collection.updateHasChanged();

    expect(collection.hasChanged).toBe(hasChanged);
  });

  it('should compare with the saved checks after saving', () => {
    collection.setChecks([anna]);
    entry(collection, 2).isChecked = true;

    collection.setHasChangedFalse();
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(false);

    entry(collection, 2).isChecked = false;
    collection.updateHasChanged();
    expect(collection.hasChanged).toBe(true);
  });
});
