import { dropSavedChanges } from './saved-changes.utils';

describe('dropSavedChanges', () => {
  it('removes the fields that are still what was sent', () => {
    const changes: Record<string, unknown> = { name: 'n', description: 'd' };

    dropSavedChanges(changes, { name: 'n', description: 'd' });

    expect(changes).toEqual({});
  });

  it('keeps a field edited again after sending', () => {
    const changes: Record<string, unknown> = { name: 'n', description: 'd and more' };

    dropSavedChanges(changes, { name: 'n', description: 'd' });

    expect(changes).toEqual({ description: 'd and more' });
  });

  it('keeps fields that were not sent', () => {
    const changes: Record<string, unknown> = { name: 'n', state: '2' };

    dropSavedChanges(changes, { name: 'n' });

    expect(changes).toEqual({ state: '2' });
  });

  it('compares structured values by content', () => {
    const changes: Record<string, unknown> = { metadata: { items: [{ id: 'A1' }] } };

    dropSavedChanges(changes, { metadata: { items: [{ id: 'A1' }] } });

    expect(changes).toEqual({});
  });
});
