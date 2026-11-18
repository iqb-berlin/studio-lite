import { compareTranslations } from './translation-check.utils';

describe('compareTranslations', () => {
  const german = {
    save: 'Speichern',
    workspace: {
      renamed: 'Arbeitsbereich umbenannt',
      'delete-many': 'Sollen {{count}} Arbeitsbereiche aus {{ group }} gelöscht werden?'
    }
  };

  it('should find nothing in a complete translation, whatever the order and spacing of placeholders', () => {
    expect(compareTranslations(german, {
      workspace: {
        'delete-many': 'Delete {{group}}\'s {{ count }} workspaces?',
        renamed: 'Workspace renamed'
      },
      save: 'Save'
    })).toEqual({ missing: [], extra: [], placeholders: [] });
  });

  it('should name the keys missing from the translation and those only it has', () => {
    expect(compareTranslations(german, {
      save: 'Save',
      workspace: { 'delete-many': 'Delete {{count}} workspaces of {{group}}?', removed: 'Workspace removed' }
    })).toEqual({ missing: ['workspace.renamed'], extra: ['workspace.removed'], placeholders: [] });
  });

  it('should name a key whose placeholders differ, as a lost one or a misspelt one', () => {
    expect(compareTranslations(german, {
      save: 'Save {{name}}',
      workspace: { renamed: 'Workspace renamed', 'delete-many': 'Delete {{count}} workspaces of {{groups}}?' }
    }).placeholders).toEqual(['save', 'workspace.delete-many']);
  });

  it('should take a section for a text as a difference in keys', () => {
    expect(compareTranslations(german, {
      save: { now: 'Save now' },
      workspace: { renamed: 'Workspace renamed', 'delete-many': 'Delete {{count}} workspaces of {{group}}?' }
    })).toEqual({ missing: ['save'], extra: ['save.now'], placeholders: [] });
  });
});
