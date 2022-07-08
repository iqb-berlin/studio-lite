import {
  Body, Controller, Get, Patch, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ConfigDto, AppLogoDto, UnitExportConfigDto } from '@studio-lite-lib/api-dto';
import { SettingService } from '../../database/services/setting.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin/settings')
export class SettingController {
  constructor(
    private settingService: SettingService
  ) {}

  @Get('config')
  @ApiCreatedResponse({
    type: ConfigDto
  })
  @ApiTags('admin settings')
  async findConfig(): Promise<ConfigDto> {
    return this.settingService.findConfig();
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchConfig(@Body() settingData: ConfigDto) {
    return this.settingService.patchConfig(settingData);
  }

  @Get('app-logo')
  @ApiCreatedResponse({
    type: AppLogoDto
  })
  @ApiTags('admin settings')
  async findAppLogo(): Promise<AppLogoDto> {
    return this.settingService.findAppLogo();
  }

  @Patch('app-logo')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchAppLogo(@Body() newLogo: AppLogoDto) {
    return this.settingService.patchAppLogo(newLogo);
  }

  @Get('unit-export-config')
  @ApiCreatedResponse({
    type: UnitExportConfigDto
  })
  @ApiTags('admin settings')
  async findUnitExportConfig(): Promise<UnitExportConfigDto> {
    return this.settingService.findUnitExportConfig();
  }

  @Patch('unit-export-config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchUnitExportConfig(@Body() newUnitExportConfig: UnitExportConfigDto) {
    return this.settingService.patchUnitExportConfig(newUnitExportConfig);
  }
}
