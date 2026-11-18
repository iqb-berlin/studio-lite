import { compareTranslations } from './translation-check.utils';

describe('compareTranslations', () => {
  const german = {
    save: 'Speichern',
    workspace: {
      renamed: 'Arbeitsbereich umbenannt',
      'delete-many': 'Sollen {{count}} Arbeitsbereiche aus {{ group }} gelöscht werden?',
      'hidden-info': ' Davon verborgen: {{hidden}}.'
    }
  };
  const nothing = {
    missing: [], extra: [], placeholders: [], whitespace: []
  };

  it('should find nothing in a complete translation, whatever the order and spacing of placeholders', () => {
    expect(compareTranslations(german, {
      workspace: {
        'hidden-info': ' Hidden: {{hidden}}.',
        'delete-many': 'Delete {{group}}\'s {{ count }} workspaces?',
        renamed: 'Workspace renamed'
      },
      save: 'Save'
    })).toEqual(nothing);
  });

  it('should name the keys missing from the translation and those only it has', () => {
    expect(compareTranslations(german, {
      save: 'Save',
      workspace: {
        'delete-many': 'Delete {{count}} workspaces of {{group}}?',
        'hidden-info': ' Hidden: {{hidden}}.',
        removed: 'Workspace removed'
      }
    })).toEqual({ ...nothing, missing: ['workspace.renamed'], extra: ['workspace.removed'] });
  });

  it('should name a key whose placeholders differ, as a lost one or a misspelt one', () => {
    expect(compareTranslations(german, {
      save: 'Save {{name}}',
      workspace: {
        renamed: 'Workspace renamed',
        'delete-many': 'Delete {{count}} workspaces of {{groups}}?',
        'hidden-info': ' Hidden: {{hidden}}.'
      }
    }).placeholders).toEqual(['save', 'workspace.delete-many']);
  });

  // The text follows another one in the template; without the space the two words run together (#2178).
  it('should name a key that lost or gained a space at its start or end', () => {
    expect(compareTranslations(german, {
      save: 'Save ',
      workspace: {
        renamed: 'Workspace renamed',
        'delete-many': 'Delete {{count}} workspaces of {{group}}?',
        'hidden-info': 'Hidden: {{hidden}}.'
      }
    }).whitespace).toEqual(['save', 'workspace.hidden-info']);
  });

  it('should take a section for a text as a difference in keys', () => {
    expect(compareTranslations(german, {
      save: { now: 'Save now' },
      workspace: {
        renamed: 'Workspace renamed',
        'delete-many': 'Delete {{count}} workspaces of {{group}}?',
        'hidden-info': ' Hidden: {{hidden}}.'
      }
    })).toEqual({ ...nothing, missing: ['save'], extra: ['save.now'] });
  });
});
