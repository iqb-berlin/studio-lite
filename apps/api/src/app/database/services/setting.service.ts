import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigDto, AppLogoDto } from '@studio-lite-lib/api-dto';
import Setting from '../entities/setting.entity';
import { UnitExportConfigDto } from '@studio-lite-lib/api-dto';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>
  ) {}

  async findConfig(): Promise<ConfigDto> {
    const setting = await this.settingsRepository.findOne({ where: { key: 'config' } });
    if (setting) {
      return JSON.parse(setting.content) as ConfigDto;
    }
    return <ConfigDto> {
      appTitle: 'IQB-Studio-Lite',
      introHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>',
      imprintHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>'
    };
  }

  async patchConfig(settingContent: ConfigDto): Promise<void> {
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

  async findAppLogo(): Promise<AppLogoDto | null> {
    const appLogo = await this.settingsRepository.findOne({ where: { key: 'app-logo' } });
    return appLogo ? JSON.parse(appLogo.content) : null;
  }

  async patchAppLogo(newLogo: AppLogoDto): Promise<void> {
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

  async findUnitExportConfig(): Promise<UnitExportConfigDto | null> {
    const unitExportConfig = await this.settingsRepository.findOne({ where: { key: 'unit-export-config' } });
    return unitExportConfig ? JSON.parse(unitExportConfig.content) : new UnitExportConfigDto();
  }

  async patchUnitExportConfig(newUnitExportConfig: UnitExportConfigDto): Promise<void> {
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
