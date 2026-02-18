import {
  AppLogoDto,
  ConfigDto,
  EmailTemplateDto,
  MissingsProfilesDto,
  ProfilesRegistryDto,
  UnitExportConfigDto
} from '@studio-lite-lib/api-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { SettingController } from './setting.controller';
import { AuthService } from '../services/auth.service';
import { SettingService } from '../services/setting.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AppVersionGuard } from '../guards/app-version.guard';

describe('SettingController', () => {
  let controller: SettingController;
  let settingService: SettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [
        {
          provide: 'APP_VERSION',
          useValue: '0.0.0'
        },
        {
          provide: AuthService,
          useValue: createMock<AuthService>()
        },
        {
          provide: SettingService,
          useValue: createMock<SettingService>()
        }
      ]
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(IsAdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AppVersionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SettingController>(SettingController);
    settingService = module.get<SettingService>(SettingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findConfig', () => {
    it('should return config', async () => {
      const mockConfig: ConfigDto = {
        appTitle: 'Test App',
        introHtml: '<p>Intro</p>',
        imprintHtml: '<p>Imprint</p>',
        globalWarningText: 'Warning',
        globalWarningExpiredDay: new Date(),
        globalWarningExpiredHour: 12
      } as ConfigDto;

      jest.spyOn(settingService, 'findConfig')
        .mockResolvedValue(mockConfig);

      const result = await controller.findConfig();

      expect(result).toEqual(mockConfig);
      expect(settingService.findConfig).toHaveBeenCalled();
    });
  });

  describe('patchConfig', () => {
    it('should update config', async () => {
      const configDto: ConfigDto = {
        appTitle: 'New Title'
      } as ConfigDto;

      jest.spyOn(settingService, 'patchConfig')
        .mockResolvedValue(undefined);

      await controller.patchConfig(configDto);

      expect(settingService.patchConfig).toHaveBeenCalledWith(configDto);
    });
  });

  describe('findAppLogo', () => {
    it('should return app logo', async () => {
      const mockLogo: AppLogoDto = {
        data: 'base64image'
      };

      jest.spyOn(settingService, 'findAppLogo')
        .mockResolvedValue(mockLogo);

      const result = await controller.findAppLogo();

      expect(result).toEqual(mockLogo);
      expect(settingService.findAppLogo).toHaveBeenCalled();
    });
  });

  describe('patchAppLogo', () => {
    it('should update app logo', async () => {
      const logoDto: AppLogoDto = {
        data: 'newbase64'
      };

      jest.spyOn(settingService, 'patchAppLogo')
        .mockResolvedValue(undefined);

      await controller.patchAppLogo(logoDto);

      expect(settingService.patchAppLogo).toHaveBeenCalledWith(logoDto);
    });
  });

  describe('findUnitExportConfig', () => {
    it('should return unit export config', async () => {
      const mockConfig: UnitExportConfigDto = {
        unitXsdUrl: 'http://example.com/unit.xsd'
      } as UnitExportConfigDto;

      jest.spyOn(settingService, 'findUnitExportConfig')
        .mockResolvedValue(mockConfig);

      const result = await controller.findUnitExportConfig();

      expect(result).toEqual(mockConfig);
      expect(settingService.findUnitExportConfig).toHaveBeenCalled();
    });
  });

  describe('patchUnitExportConfig', () => {
    it('should update unit export config', async () => {
      const configDto: UnitExportConfigDto = {
        unitXsdUrl: 'http://example.com/new-unit.xsd'
      } as UnitExportConfigDto;

      jest.spyOn(settingService, 'patchUnitExportConfig')
        .mockResolvedValue(undefined);

      await controller.patchUnitExportConfig(configDto);

      expect(settingService.patchUnitExportConfig).toHaveBeenCalledWith(configDto);
    });
  });

  describe('findUnitProfilesRegistry', () => {
    it('should return profiles registry', async () => {
      const mockRegistry: ProfilesRegistryDto = {
        csvUrl: 'http://example.com/registry.csv'
      };

      jest.spyOn(settingService, 'findUnitProfilesRegistry')
        .mockResolvedValue(mockRegistry);

      const result = await controller.findUnitProfilesRegistry();

      expect(result).toEqual(mockRegistry);
      expect(settingService.findUnitProfilesRegistry).toHaveBeenCalled();
    });
  });

  describe('patchProfilesRegistry', () => {
    it('should update profiles registry', async () => {
      const registryDto: ProfilesRegistryDto = {
        csvUrl: 'http://example.com/new-registry.csv'
      };

      jest.spyOn(settingService, 'patchProfilesRegistry')
        .mockResolvedValue(undefined);

      await controller.patchProfilesRegistry(registryDto);

      expect(settingService.patchProfilesRegistry).toHaveBeenCalledWith(registryDto);
    });
  });

  describe('findEmailTemplate', () => {
    it('should return email template', async () => {
      const mockTemplate: EmailTemplateDto = {
        emailBody: '<p>Template</p>'
      } as EmailTemplateDto;

      jest.spyOn(settingService, 'findEmailTemplate')
        .mockResolvedValue(mockTemplate);

      const result = await controller.findEmailTemplate();

      expect(result).toEqual(mockTemplate);
      expect(settingService.findEmailTemplate).toHaveBeenCalled();
    });
  });

  describe('patchEmailTemplate', () => {
    it('should update email template', async () => {
      const templateDto: EmailTemplateDto = {
        emailBody: '<p>New Template</p>'
      } as EmailTemplateDto;

      jest.spyOn(settingService, 'patchEmailTemplate')
        .mockResolvedValue(undefined);

      await controller.patchEmailTemplate(templateDto);

      expect(settingService.patchEmailTemplate).toHaveBeenCalledWith(templateDto);
    });
  });

  describe('findMissingsProfiles', () => {
    it('should return missing profiles', async () => {
      const mockProfiles: MissingsProfilesDto[] = [
        {
          id: 1,
          label: 'Profile 1'
        },
        {
          id: 2,
          label: 'Profile 2'
        }
      ];

      jest.spyOn(settingService, 'findMissingsProfiles')
        .mockResolvedValue(mockProfiles);

      const result = await controller.findMissingsProfiles();

      expect(result).toEqual(mockProfiles);
      expect(settingService.findMissingsProfiles).toHaveBeenCalled();
    });
  });

  describe('patchMissingsProfiles', () => {
    it('should update missing profiles', async () => {
      const profileDto: MissingsProfilesDto = {
        id: 1,
        label: 'Profile 1'
      };

      jest.spyOn(settingService, 'patchMissingsProfiles')
        .mockResolvedValue(undefined);

      await controller.patchMissingsProfiles(profileDto);

      expect(settingService.patchMissingsProfiles).toHaveBeenCalledWith(profileDto);
    });
  });
});
