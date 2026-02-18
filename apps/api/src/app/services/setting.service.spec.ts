import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  ConfigDto, AppLogoDto, UnitExportConfigDto, MissingsProfilesDto, ProfilesRegistryDto, EmailTemplateDto
} from '@studio-lite-lib/api-dto';
import Setting from '../entities/setting.entity';
import { UsersService } from './users.service';
import { SettingService } from './setting.service';

describe('SettingService', () => {
  let service: SettingService;
  let settingsRepository: DeepMocked<Repository<Setting>>;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        {
          provide: getRepositoryToken(Setting),
          useValue: createMock<Repository<Setting>>()
        },
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        }
      ]
    }).compile();

    service = module.get<SettingService>(SettingService);
    settingsRepository = module.get(getRepositoryToken(Setting));
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
});
