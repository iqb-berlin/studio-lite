import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  ConfigDto, AppLogoDto, UnitExportConfigDto, MissingsProfilesDto,
  ProfilesRegistryDto, EmailTemplateDto, UnitRichNoteTagDto, MetadataVocabularyDto
} from '@studio-lite-lib/api-dto';
import Setting from '../entities/setting.entity';
import WorkspaceGroup from '../entities/workspace-group.entity';
import { UsersService } from './users.service';
import { SettingService } from './setting.service';
import { MetadataVocabularyService } from './metadata-vocabulary.service';

describe('SettingService', () => {
  let service: SettingService;
  let settingsRepository: DeepMocked<Repository<Setting>>;
  let workspaceGroupRepository: DeepMocked<Repository<WorkspaceGroup>>;
  let usersService: DeepMocked<UsersService>;
  let metadataVocabularyService: DeepMocked<MetadataVocabularyService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        {
          provide: getRepositoryToken(Setting),
          useValue: createMock<Repository<Setting>>()
        },
        {
          provide: getRepositoryToken(WorkspaceGroup),
          useValue: createMock<Repository<WorkspaceGroup>>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: MetadataVocabularyService,
          useValue: createMock<MetadataVocabularyService>()
        }
      ]
    }).compile();

    service = module.get<SettingService>(SettingService);
    settingsRepository = module.get(getRepositoryToken(Setting));
    workspaceGroupRepository = module.get(getRepositoryToken(WorkspaceGroup));
    usersService = module.get(UsersService);
    metadataVocabularyService = module.get(MetadataVocabularyService);
    metadataVocabularyService.getStoredMetadataVocabularyById.mockResolvedValue(null);
  });

  describe('findConfig', () => {
    it('should return config if setting exists', async () => {
      const config: ConfigDto = { appTitle: 'Test', hasUsers: true } as ConfigDto;
      const setting = { key: 'config', content: JSON.stringify(config) } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);
      usersService.hasUsers.mockResolvedValue(true);

      const result = await service.findConfig();
      expect(result.appTitle).toBe('Test');
      expect(result.hasUsers).toBe(true);
    });

    it('should return default config if setting does not exist', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      usersService.hasUsers.mockResolvedValue(false);

      const result = await service.findConfig();
      expect(result.appTitle).toBe('IQB-Studio');
      expect(result.hasUsers).toBe(false);
    });
  });

  describe('patchConfig', () => {
    it('should update existing config', async () => {
      const setting = { key: 'config', content: '{}' } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);

      await service.patchConfig({ appTitle: 'New' } as ConfigDto);
      expect(settingsRepository.save).toHaveBeenCalled();
      expect(JSON.parse(setting.content).appTitle).toBe('New');
    });

    it('should create new config if not exists', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      settingsRepository.create.mockReturnValue({ key: 'config' } as Setting);

      await service.patchConfig({ appTitle: 'New' } as ConfigDto);
      expect(settingsRepository.create).toHaveBeenCalled();
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAppLogo', () => {
    it('should return null if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      expect(await service.findAppLogo()).toBeNull();
    });

    it('should return parsed logo', async () => {
      const setting = { key: 'app-logo', content: JSON.stringify({ data: 'logo' }) } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);
      const result = await service.findAppLogo();
      expect(result).toEqual({ data: 'logo' });
    });
  });

  describe('patchAppLogo', () => {
    it('should update logo', async () => {
      const setting = { key: 'app-logo', content: '{}' } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);
      await service.patchAppLogo({} as AppLogoDto);
      expect(settingsRepository.save).toHaveBeenCalled();
    });

    it('should create logo', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      settingsRepository.create.mockReturnValue({} as Setting);
      await service.patchAppLogo({} as AppLogoDto);
      expect(settingsRepository.create).toHaveBeenCalled();
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findUnitExportConfig', () => {
    it('should return default if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findUnitExportConfig();
      expect(result).toBeInstanceOf(UnitExportConfigDto);
    });
  });

  describe('patchUnitExportConfig', () => {
    it('should update config', async () => {
      settingsRepository.findOne.mockResolvedValue({} as Setting);
      await service.patchUnitExportConfig({} as UnitExportConfigDto);
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findMissingsProfiles', () => {
    it('should return empty array if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findMissingsProfiles();
      expect(result).toEqual([]);
    });
  });

  describe('patchMissingsProfiles', () => {
    it('should update profiles', async () => {
      settingsRepository.findOne.mockResolvedValue({} as Setting);
      await service.patchMissingsProfiles({} as MissingsProfilesDto);
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findUnitProfilesRegistry', () => {
    it('should return new dto if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findUnitProfilesRegistry();
      expect(result).toBeInstanceOf(ProfilesRegistryDto);
    });

    // Pins the default: it is the w3id permanent identifier of the registry, not
    // the redirect target, and changeset 7 of the 19.0.0 migration moves stored
    // settings onto exactly this value (#1570).
    it('defaults to the canonical w3id registry url', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findUnitProfilesRegistry();
      expect(result.csvUrl).toBe('https://w3id.org/iqb/metadata-registry');
    });
  });

  describe('patchProfilesRegistry', () => {
    it('should update registry', async () => {
      settingsRepository.findOne.mockResolvedValue({} as Setting);
      await service.patchProfilesRegistry({} as ProfilesRegistryDto);
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findEmailTemplate', () => {
    it('should return new dto if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findEmailTemplate();
      expect(result).toBeInstanceOf(EmailTemplateDto);
    });
  });

  describe('patchEmailTemplate', () => {
    it('should update template', async () => {
      settingsRepository.findOne.mockResolvedValue({} as Setting);
      await service.patchEmailTemplate({} as EmailTemplateDto);
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });

  describe('findUnitRichNoteTags', () => {
    it('should return empty array if not found', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      const result = await service.findUnitRichNoteTags();
      expect(result).toEqual([]);
    });

    it('should return parsed tags', async () => {
      const tags = [{ id: 't1', label: [] }];
      const setting = { key: 'unit-rich-note-tags', content: JSON.stringify(tags) } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);
      const result = await service.findUnitRichNoteTags();
      expect(result).toEqual(tags);
    });

    it('should return group-specific tags if workspaceGroupId is provided', async () => {
      const groupTags = ['http://example.com/vocab'];
      const group = { id: 1, settings: { richNoteTags: groupTags } } as unknown as WorkspaceGroup;
      workspaceGroupRepository.findOneBy.mockResolvedValue(group);

      const vocabulary = {
        id: 'vocab1',
        hasTopConcept: [{ id: 'c1', prefLabel: { de: 'Concept 1' } }]
      };
      metadataVocabularyService.getStoredMetadataVocabularyById.mockResolvedValue(
        vocabulary as unknown as MetadataVocabularyDto
      );

      const result = await service.findUnitRichNoteTags(1);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('vocab1#c1');
    });

    it('should fall back to global settings if group has empty tags configured', async () => {
      const group = { id: 1, settings: { richNoteTags: [] } } as unknown as WorkspaceGroup;
      workspaceGroupRepository.findOneBy.mockResolvedValue(group);

      const globalTags = [{ id: 'global1', label: [] }];
      const setting = { key: 'unit-rich-note-tags', content: JSON.stringify(globalTags) } as Setting;
      settingsRepository.findOne.mockResolvedValue(setting);

      const result = await service.findUnitRichNoteTags(1);
      expect(result).toEqual(globalTags);
      expect(settingsRepository.findOne).toHaveBeenCalled();
    });

    it('should return empty array and not fall back to default if global has explicitly empty tags configured',
      async () => {
        workspaceGroupRepository.findOneBy.mockResolvedValue(null);
        const setting = { key: 'unit-rich-note-tags', content: '[]' } as Setting;
        settingsRepository.findOne.mockResolvedValue(setting);

        const result = await service.findUnitRichNoteTags();
        expect(result).toEqual([]);
        expect(metadataVocabularyService.getStoredMetadataVocabularyById).not.toHaveBeenCalled();
      });
  });

  // A configuration is a list of tags, or one or more vocabulary URLs whose top concepts become the tags.
  describe('tags from vocabularies', () => {
    const vocabulary = (id: string, conceptId: string) => ({
      id, hasTopConcept: [{ id: conceptId, prefLabel: { de: conceptId } }]
    }) as unknown as MetadataVocabularyDto;
    const globalSetting = (content: unknown) => settingsRepository.findOne
      .mockResolvedValue({ key: 'unit-rich-note-tags', content: JSON.stringify(content) } as Setting);

    // One vocabulary that cannot be used must not cost the tags of the others.
    it('should gather the tags of every vocabulary with concepts, skipping what is no web address', async () => {
      globalSetting(['https://a.org/v', 'https://b.org/v', 'https://c.org/v', 'urn:x']);
      metadataVocabularyService.getStoredMetadataVocabularyById.mockImplementation(async url => ({
        'https://a.org/v': vocabulary(url, 'c1'),
        'https://b.org/v': { id: url } as MetadataVocabularyDto
      })[url] ?? null);

      const tags = await service.findUnitRichNoteTags();

      expect(tags.map(tag => tag.id)).toEqual(['https://a.org/v#c1']);
      expect(metadataVocabularyService.getStoredMetadataVocabularyById).not.toHaveBeenCalledWith('urn:x');
    });

    it.each([
      ['one URL stored as text', () => globalSetting('https://v.org/')],
      ['the URL of a group, stored as text', () => {
        settingsRepository.findOne.mockResolvedValue(null);
        workspaceGroupRepository.findOneBy.mockResolvedValue(
          { id: 1, settings: { richNoteTags: 'https://v.org/' } } as unknown as WorkspaceGroup
        );
      }]
    ])('should take the tags of %s', async (_, given) => {
      given();
      metadataVocabularyService.getStoredMetadataVocabularyById.mockImplementation(
        async url => (url === 'https://v.org/' ? vocabulary(url, 'c1') : null)
      );

      expect((await service.findUnitRichNoteTags(1)).map(tag => tag.id)).toEqual(['https://v.org/#c1']);
    });

    it('should take the tags of the default vocabulary without any setting', async () => {
      settingsRepository.findOne.mockResolvedValue(null);
      metadataVocabularyService.getStoredMetadataVocabularyById.mockImplementation(async url => vocabulary(url, 'c1'));

      const tags = await service.findUnitRichNoteTags();

      expect(tags).toHaveLength(1);
      expect(tags[0].id).toMatch(/^https:.*#c1$/);
    });

    it('should name a concept without label by its id, keep an absolute id, nest the narrower ones', async () => {
      globalSetting('https://v.org/');
      metadataVocabularyService.getStoredMetadataVocabularyById.mockResolvedValue({
        id: 'https://v.org/',
        hasTopConcept: [
          { id: 'c1' },
          {
            id: 'https://other.org/c2',
            prefLabel: { de: 'Zwei', en: 'Two' },
            narrower: [{ id: 'c3', prefLabel: { de: 'Drei' } }]
          }
        ]
      } as unknown as MetadataVocabularyDto);

      expect(await service.findUnitRichNoteTags()).toEqual([
        { id: 'https://v.org/#c1', label: [{ lang: 'de', value: 'c1' }], children: [] },
        {
          id: 'https://other.org/c2',
          label: [{ lang: 'de', value: 'Zwei' }, { lang: 'en', value: 'Two' }],
          children: [{ id: 'https://v.org/#c3', label: [{ lang: 'de', value: 'Drei' }], children: [] }]
        }
      ]);
    });
  });

  // What the admin form shows; it edits a list of URLs or tags.
  describe('findUnitRichNoteTagsConfig', () => {
    const stored = (content: string) => settingsRepository.findOne
      .mockResolvedValue({ key: 'unit-rich-note-tags', content } as Setting);

    it.each([
      ['a list as it is stored', '["https://a.org/v","https://b.org/v"]', ['https://a.org/v', 'https://b.org/v']],
      ['a single URL as a list', '"https://a.org/v"', ['https://a.org/v']]
    ])('should give %s', async (_, content, expected) => {
      stored(content);

      expect(await service.findUnitRichNoteTagsConfig()).toEqual(expected);
    });

    it('should give the default vocabulary for a setting that is missing or cannot be read', async () => {
      const logError = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      try {
        settingsRepository.findOne.mockResolvedValue(null);
        const withoutSetting = await service.findUnitRichNoteTagsConfig();
        stored('{kaputt');

        expect(await service.findUnitRichNoteTagsConfig()).toEqual(withoutSetting);
        expect(withoutSetting).toEqual([expect.stringMatching(/^https:/)]);
      } finally {
        logError.mockRestore();
      }
    });
  });

  describe('patchUnitRichNoteTags', () => {
    it('should update tags', async () => {
      settingsRepository.findOne.mockResolvedValue({} as Setting);
      await service.patchUnitRichNoteTags([] as UnitRichNoteTagDto[]);
      expect(settingsRepository.save).toHaveBeenCalled();
    });
  });
});
