import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ConfigDto, AppLogoDto, UnitExportConfigDto, MissingsProfilesDto,
  ProfilesRegistryDto, EmailTemplateDto, UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';

import Setting from '../entities/setting.entity';
import { UsersService } from './users.service';

@Injectable()
export class SettingService {
  private readonly logger = new Logger(SettingService.name);

  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
    private usersService: UsersService
  ) {}

  async findConfig(): Promise<ConfigDto> {
    this.logger.log('Returning settings config.');
    const setting = await this.settingsRepository.findOne({ where: { key: 'config' } });
    const hasUsers = await this.usersService.hasUsers();
    if (setting) {
      const settings = JSON.parse(setting.content) as ConfigDto;
      settings.hasUsers = hasUsers;
      return settings;
    }
    // TODO: Template ist Aufgabe des Frontends (findConfig ist get):
    return <ConfigDto> {
      appTitle: 'IQB-Studio',
      introHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>',
      imprintHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>',
      emailSubject: '',
      emailBody: '',
      hasUsers: hasUsers
    };
    // TODO: Exception anstatt des Templates
  }

  // TODO: ist das in diesem Fall ein PUT?
  async patchConfig(settingContent: ConfigDto): Promise<void> {
    this.logger.log('Updating settings config.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'config' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(settingContent);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'config',
        content: JSON.stringify(settingContent)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  // TODO: Kein null als Rückgabe sondern exception. Frontend muss damit umgehen
  async findAppLogo(): Promise<AppLogoDto | null> {
    this.logger.log('Returning settings app logo.');
    const appLogo = await this.settingsRepository.findOne({ where: { key: 'app-logo' } });
    return appLogo ? JSON.parse(appLogo.content) : null;
  }

  // TODO: ist das in diesem Fall ein PUT?
  async patchAppLogo(newLogo: AppLogoDto): Promise<void> {
    this.logger.log('Updating settings app logo.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'app-logo' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(newLogo);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'app-logo',
        content: JSON.stringify(newLogo)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  async findUnitExportConfig(): Promise<UnitExportConfigDto | null> {
    this.logger.log('Returning settings unit export config.');
    const unitExportConfig = await this.settingsRepository.findOne({ where: { key: 'unit-export-config' } });
    return unitExportConfig ? JSON.parse(unitExportConfig.content) : new UnitExportConfigDto();
  }

  async patchUnitExportConfig(newUnitExportConfig: UnitExportConfigDto): Promise<void> {
    this.logger.log('Updating settings unit export config.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'unit-export-config' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(newUnitExportConfig);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'unit-export-config',
        content: JSON.stringify(newUnitExportConfig)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  async findMissingsProfiles(): Promise<MissingsProfilesDto[] | null> {
    this.logger.log('Returning settings missings profiles config.');
    const missingsProfiles = await this.settingsRepository.findOne({ where: { key: 'missings-profile-iqb-standard' } });
    return missingsProfiles ? JSON.parse(missingsProfiles.content) : [];
  }

  async patchMissingsProfiles(newMissingsProfiles: MissingsProfilesDto): Promise<void> {
    this.logger.log('Updating settings missings profiles config.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'missings-profiles-iqb-standard' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(newMissingsProfiles);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'missings-profile-iqb-standard',
        content: JSON.stringify(newMissingsProfiles)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  async findUnitProfilesRegistry(): Promise<ProfilesRegistryDto> {
    this.logger.log('Returning settings profiles registry.');
    const profilesRegistry = await this.settingsRepository.findOne({ where: { key: 'profiles-registry' } });
    return profilesRegistry ? JSON.parse(profilesRegistry.content) : new ProfilesRegistryDto();
  }

  async patchProfilesRegistry(newProfilesRegistry: ProfilesRegistryDto) {
    this.logger.log('Updating settings profiles registry.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'profiles-registry' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(newProfilesRegistry);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'profiles-registry',
        content: JSON.stringify(newProfilesRegistry)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  async findEmailTemplate(): Promise<EmailTemplateDto> {
    this.logger.log('Returning email template settings');
    const profilesRegistry = await this.settingsRepository.findOne({ where: { key: 'email-template' } });
    return profilesRegistry ? JSON.parse(profilesRegistry.content) : new EmailTemplateDto();
  }

  async patchEmailTemplate(emailTemplateDto: EmailTemplateDto) {
    this.logger.log('Updating email template settings.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'email-template' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(emailTemplateDto);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'email-template',
        content: JSON.stringify(emailTemplateDto)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  async findUnitRichNoteTags(): Promise<UnitRichNoteTagDto[]> {
    this.logger.log('Returning unit rich note tags settings');
    const setting = await this.settingsRepository.findOne({ where: { key: 'unit-rich-note-tags' } });
    if (setting) {
      return JSON.parse(setting.content);
    }
    return [
      {
        id: 'transcript',
        label: [{ lang: 'de', value: 'Transkript für das Haupt-Audio' }],
        children: [
          {
            id: 'original',
            label: [{ lang: 'de', value: 'Transkript der Originalquelle' }]
          },
          {
            id: 'adapted',
            label: [{ lang: 'de', value: 'Transkript der angepassten Version für die Aufgabe' }]
          }
        ]
      },
      {
        id: 'didactical_guide',
        label: [{ lang: 'de', value: 'Didaktische Handreichungen' }],
        children: [
          {
            id: 'answering',
            label: [{ lang: 'de', value: 'Beantwortung' }],
            children: [
              { id: 'full_credit', label: [{ lang: 'de', value: 'Richtige Antworten' }] },
              { id: 'competence_level', label: [{ lang: 'de', value: 'Diskussion des Schwierigkeitsniveaus' }] },
              { id: 'misconceptions', label: [{ lang: 'de', value: 'Typische Falschantworten' }] },
              { id: 'problems', label: [{ lang: 'de', value: 'Mögliche Probleme bei der Beantwortung' }] }
            ]
          },
          {
            id: 'adaptation',
            label: [{ lang: 'de', value: 'Empfehlungen zur Modifikation' }],
            children: [
              { id: 'stimulus', label: [{ lang: 'de', value: 'Den Stimulus verändern' }] },
              { id: 'items', label: [{ lang: 'de', value: 'Die Fragen/Items verändern' }] }
            ]
          }
        ]
      }
    ];
  }

  async patchUnitRichNoteTags(tags: UnitRichNoteTagDto[]) {
    this.logger.log('Updating unit rich note tags settings.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'unit-rich-note-tags' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(tags);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = this.settingsRepository.create({
        key: 'unit-rich-note-tags',
        content: JSON.stringify(tags)
      });
      await this.settingsRepository.save(newSetting);
    }
  }
}
