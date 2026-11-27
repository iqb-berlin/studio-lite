import {
  ModuleVersion, newerModule, NewerModuleQuery, writtenFormat
} from './newer-module.utils';

// as the API lists a module: installed at a date sent as text, declaring the formats it reads
const version = (
  nameAndVersion: string,
  installed: string | number,
  model?: string,
  isStable = true
): ModuleVersion => ({
  nameAndVersion,
  fileDateTime: installed,
  metadata: {
    model, isStable, version: nameAndVersion.split(' ').pop()
  }
});

const aspect = (upTo: string) => `aspect-unit-definition@>=4.0 <=${upTo}`;
const january = '2026-01-01T10:00:00.000Z';
const march = '2026-03-01T10:00:00.000Z';
const may = '2026-05-01T10:00:00.000Z';
const april = new Date('2026-04-01T10:00:00.000Z');

const playerQuery = (installed: Record<string, ModuleVersion>, fields: Partial<NewerModuleQuery> = {}) => ({
  usedKey: 'iqb-player-aspect@2.12',
  installed: { 'iqb-player-aspect@2.12': version('Player 2.12.4', january, aspect('4.12')), ...installed },
  format: 'aspect-unit-definition@4.12.0',
  lastChanged: april,
  ...fields
});

describe('writtenFormat', () => {
  it('takes the upper end of a range as what an editor writes, as aspect declares it', () => {
    expect(writtenFormat('aspect-unit-definition@>=4.0 <=4.13')).toBe('aspect-unit-definition@4.13');
    expect(writtenFormat('aspect-unit-definition@>= 4.0 <= 4.13')).toBe('aspect-unit-definition@4.13');
  });

  it('knows nothing without one upper end written <=', () => {
    expect(writtenFormat(undefined)).toBeUndefined();
    expect(writtenFormat('CALC')).toBeUndefined();
    expect(writtenFormat('aspect-unit-definition@>=4.0')).toBeUndefined();
    expect(writtenFormat('aspect-unit-definition@>=4.0 <4.14')).toBeUndefined();
    expect(writtenFormat('aspect-unit-definition@4.13')).toBeUndefined();
    expect(writtenFormat('aspect-unit-definition@>=4.0 <=4.5 || >=5.0 <=5.2')).toBeUndefined();
  });
});

describe('newerModule', () => {
  it('names a newer version installed before the unit was last saved with the older one', () => {
    expect(newerModule(playerQuery({ 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) })))
      .toEqual({ used: 'Player 2.12.4', newer: 'Player 2.13.0' });
  });

  it('names nothing for a unit last saved before, or never', () => {
    const installed = { 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) };
    expect(newerModule(playerQuery(installed, { lastChanged: new Date('2026-02-01T10:00:00.000Z') }))).toBeUndefined();
    expect(newerModule(playerQuery(installed, { lastChanged: undefined }))).toBeUndefined();
  });

  it('counts no pre-release, no other module, no earlier version and none without an install date', () => {
    expect(newerModule(playerQuery({
      'iqb-player-aspect@2.13.0-beta.1': version('Player 2.13.0-beta.1', march, aspect('4.13'), false),
      'iqb-player-other@3.0': version('Other 3.0.0', march),
      'iqb-player-aspect@2.11': version('Player 2.11.0', march, aspect('4.11')),
      'iqb-player-aspect@2.14': version('Player 2.14.0', 0, aspect('4.14')),
      'iqb-player-aspect@2.15': version('Player 2.15.0', 'not a date', aspect('4.15'))
    }))).toBeUndefined();
  });

  // the studio lists a pre-release after its release
  it('counts the release of a pre-release in use as newer', () => {
    const beta = 'iqb-player-aspect@2.13.0-beta.1';
    const installed = {
      [beta]: version('Player 2.13.0-beta.1', '2026-01-01T10:00:00.000Z', aspect('4.13'), false),
      'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13'))
    };
    expect(newerModule(playerQuery(installed, { usedKey: beta })))
      .toEqual({ used: 'Player 2.13.0-beta.1', newer: 'Player 2.13.0' });
    // only the earlier release 2.12.4 beside it
    expect(newerModule(playerQuery({ [beta]: installed[beta] }, { usedKey: beta }))).toBeUndefined();
  });

  it('counts a version that reads the unit, whatever its major version, and none that does not', () => {
    expect(newerModule(playerQuery({ 'iqb-player-aspect@3.0': version('Player 3.0.0', march, aspect('5.0')) })))
      .toEqual({ used: 'Player 2.12.4', newer: 'Player 3.0.0' });
    expect(newerModule(playerQuery({
      'iqb-player-aspect@3.0': version('Player 3.0.0', march, 'aspect-unit-definition@>=5.0 <=5.0')
    }))).toBeUndefined();
  });

  // what declares nothing, as aspect before 3.0, Stars, Speedtest or Abi, cannot be told to fit
  it('names nothing that does not declare that it reads the unit, nor for a unit without a format', () => {
    expect(newerModule(playerQuery({ 'iqb-player-aspect@2.13': version('Player 2.13.0', march) }))).toBeUndefined();
    expect(newerModule(playerQuery(
      { 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) },
      { format: undefined }
    ))).toBeUndefined();
  });

  // each schemer version carries on the one before it, on the same responses
  it('counts, for the schemer, a version that declares nothing, but not one that declares another format', () => {
    const schemerQuery = (model?: string): NewerModuleQuery => ({
      usedKey: 'iqb-schemer@2.5',
      installed: {
        'iqb-schemer@2.5': version('Schemer 2.5.0', january),
        'iqb-schemer@3.0': version('Schemer 3.0.0', march, model)
      },
      format: 'iqb-standard@3.0',
      lastChanged: april,
      successive: true
    });
    expect(newerModule(schemerQuery())).toEqual({ used: 'Schemer 2.5.0', newer: 'Schemer 3.0.0' });
    expect(newerModule(schemerQuery('iqb-standard@>=4.0 <=4.0'))).toBeUndefined();
  });

  it('names the newest fitting version, and asks whether the unit was saved after the first was there', () => {
    expect(newerModule(playerQuery({
      'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')),
      'iqb-player-aspect@2.14': version('Player 2.14.0', may, aspect('4.14'))
    }))).toEqual({ used: 'Player 2.12.4', newer: 'Player 2.14.0' });
  });

  describe('for an editor', () => {
    const editorQuery = (
      editors: Record<string, ModuleVersion>,
      players: Record<string, ModuleVersion>,
      usedPlayer = 'iqb-player-aspect@2.12'
    ): NewerModuleQuery => ({
      usedKey: 'iqb-editor-aspect@2.12',
      installed: { 'iqb-editor-aspect@2.12': version('Editor 2.12.4', january, aspect('4.12')), ...editors },
      format: 'aspect-unit-definition@4.12.0',
      lastChanged: april,
      players: {
        usedKey: usedPlayer,
        installed: { 'iqb-player-aspect@2.12': version('Player 2.12.4', march, aspect('4.12')), ...players }
      }
    });
    const editor213 = { 'iqb-editor-aspect@2.13': version('Editor 2.13.0', march, aspect('4.13')) };

    it('names a newer editor whose content the unit\'s player reads', () => {
      const player213 = { 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) };
      expect(newerModule(editorQuery(editor213, player213, 'iqb-player-aspect@2.13')))
        .toEqual({ used: 'Editor 2.12.4', newer: 'Editor 2.13.0' });
    });

    it('names the newest version of the unit\'s player that reads what the newer editor writes', () => {
      expect(newerModule(editorQuery(editor213, {
        'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')),
        'iqb-player-aspect@2.14': version('Player 2.14.0', may, aspect('4.14')),
        'iqb-player-aspect@2.15.0-beta.1': version('Player 2.15.0-beta.1', may, aspect('4.15'), false)
      }))).toEqual({
        used: 'Editor 2.12.4', newer: 'Editor 2.13.0', player: { used: 'Player 2.12.4', newer: 'Player 2.14.0' }
      });
    });

    it('names no editor whose content no installed version of the unit\'s player reads', () => {
      expect(newerModule(editorQuery(editor213, {}))).toBeUndefined();
    });

    it('names no editor where it is not known what it writes, or who plays the unit', () => {
      const editorWithoutEnd = {
        'iqb-editor-aspect@2.13': version('Editor 2.13.0', march, 'aspect-unit-definition@>=4.0')
      };
      const player213 = { 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) };
      expect(newerModule(editorQuery(editorWithoutEnd, player213))).toBeUndefined();
      expect(newerModule(editorQuery(editor213, player213, ''))).toBeUndefined();
    });

    // aspect before 3.0: editor and player versions ran apart, and neither declares a format
    it('names the player to update with the editor where the unit\'s player declares nothing', () => {
      const player24 = { 'iqb-player-aspect@2.4': version('Player 2.4.11', january) };
      const player213 = { 'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13')) };
      expect(newerModule(editorQuery(editor213, { ...player24, ...player213 }, 'iqb-player-aspect@2.4'))).toEqual({
        used: 'Editor 2.12.4', newer: 'Editor 2.13.0', player: { used: 'Player 2.4.11', newer: 'Player 2.13.0' }
      });
      // and none where no newer version of the player declares that it reads it
      expect(newerModule(editorQuery(editor213, player24, 'iqb-player-aspect@2.4'))).toBeUndefined();
    });

    it('names the release of a pre-release player in use as the player to update with the editor', () => {
      const beta = 'iqb-player-aspect@2.13.0-beta.1';
      expect(newerModule(editorQuery(editor213, {
        [beta]: version('Player 2.13.0-beta.1', january, aspect('4.12'), false),
        'iqb-player-aspect@2.13': version('Player 2.13.0', march, aspect('4.13'))
      }, beta))).toEqual({
        used: 'Editor 2.12.4', newer: 'Editor 2.13.0', player: { used: 'Player 2.13.0-beta.1', newer: 'Player 2.13.0' }
      });
    });
  });
});
