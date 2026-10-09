import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { unitPropertiesWithoutMetadata } from './unit-properties-without-metadata';

describe('unitPropertiesWithoutMetadata', () => {
  const properties: UnitPropertiesDto = {
    id: 4,
    uuid: 'unit-uuid',
    key: 'U4',
    name: 'Tier4',
    state: '1',
    groupName: 'Gruppe',
    player: 'iqb-player-aspect@2.5',
    editor: 'iqb-editor-aspect@2.5',
    schemer: 'iqb-schemer@2.0',
    schemeType: 'iqb-standard@3.0',
    description: 'Beschreibung',
    transcript: 'Transkript',
    reference: 'Quelle',
    metadata: {
      profiles: [{ profileId: 'unit-profile', entries: [] }],
      items: [{
        uuid: 'item-uuid', id: '01a', description: 'Item', profiles: [{ profileId: 'item-profile', entries: [] }]
      }]
    },
    lastChangedMetadata: new Date('2026-10-01'),
    lastChangedDefinition: new Date('2026-10-02'),
    lastChangedScheme: new Date('2026-10-03'),
    lastChangedMetadataUser: 'a',
    lastChangedDefinitionUser: 'b',
    lastChangedSchemeUser: 'c'
  };

  it('should keep what the review needs to play and name the unit', () => {
    expect(unitPropertiesWithoutMetadata(properties)).toMatchObject({
      id: 4,
      uuid: 'unit-uuid',
      key: 'U4',
      name: 'Tier4',
      state: '1',
      groupName: 'Gruppe',
      player: 'iqb-player-aspect@2.5',
      editor: 'iqb-editor-aspect@2.5',
      schemer: 'iqb-schemer@2.0',
      schemeType: 'iqb-standard@3.0'
    });
  });

  it('should keep only the ids of the items, by which comments name them', () => {
    expect(unitPropertiesWithoutMetadata(properties).metadata).toEqual({ items: [{ uuid: 'item-uuid', id: '01a' }] });
  });

  it('should leave out description, transcript, reference and the last changes', () => {
    const result = unitPropertiesWithoutMetadata(properties);
    [
      'description', 'transcript', 'reference', 'lastChangedMetadata', 'lastChangedDefinition', 'lastChangedScheme',
      'lastChangedMetadataUser', 'lastChangedDefinitionUser', 'lastChangedSchemeUser'
    ].forEach(field => expect(result).not.toHaveProperty(field));
  });

  it('should answer a unit without metadata with an empty item list', () => {
    expect(unitPropertiesWithoutMetadata({ id: 1 }).metadata).toEqual({ items: [] });
  });
});
