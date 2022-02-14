import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigFullDto } from '@studio-lite-lib/api-dto';
import Setting from '../entities/setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>
  ) {}

  async findConfig(): Promise<ConfigFullDto> {
    const setting = await this.settingsRepository.findOne({ where: { key: 'config' } });
    if (setting) {
      return setting.content as ConfigFullDto;
    }
    return <ConfigFullDto> {
      appTitle: 'IQB-Studio-Lite',
      introHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>',
      imprintHtml: '<p>Bitte ändern Sie diesen Text über die Admin-Funktion.</p>'
    };
  }

  async patchConfig(settingContent: ConfigFullDto): Promise<void> {
    const settingToUpdate = await this.settingsRepository.findOne({ where: { key: 'config' } });
    if (settingToUpdate) {
      settingToUpdate.content = settingContent;
      await this.settingsRepository.save(settingToUpdate);
    } else {
      const newSetting = await this.settingsRepository.create({
        key: 'config',
        content: settingContent
      });
      await this.settingsRepository.save(newSetting);
    }
  }
}
