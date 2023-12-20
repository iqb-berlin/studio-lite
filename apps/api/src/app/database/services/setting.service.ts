import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigDto, AppLogoDto, UnitExportConfigDto } from '@studio-lite-lib/api-dto';
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
      const newSetting = await this.settingsRepository.create({
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
      const newSetting = await this.settingsRepository.create({
        key: 'app-logo',
        content: JSON.stringify(newLogo)
      });
      await this.settingsRepository.save(newSetting);
    }
  }

  // TODO: Kein null als Rückgabe sondern exception. Frontend muss damit umgehen
  async findUnitExportConfig(): Promise<UnitExportConfigDto | null> {
    this.logger.log('Returning settings unit export config.');
    const unitExportConfig = await this.settingsRepository.findOne({ where: { key: 'unit-export-config' } });
    return unitExportConfig ? JSON.parse(unitExportConfig.content) : new UnitExportConfigDto();
  }

  // TODO: ist das in diesem Fall ein PUT?
  async patchUnitExportConfig(newUnitExportConfig: UnitExportConfigDto): Promise<void> {
    this.logger.log('Updating settings unit export config.');
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'unit-export-config' } });
    if (settingToUpdate) {
      settingToUpdate.content = JSON.stringify(newUnitExportConfig);
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = await this.settingsRepository.create({
        key: 'unit-export-config',
        content: JSON.stringify(newUnitExportConfig)
      });
      await this.settingsRepository.save(newSetting);
    }
  }
}
