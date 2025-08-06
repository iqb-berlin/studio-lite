import {
  Body, Controller, Get, Inject, Patch, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiHeader, ApiOkResponse, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  MissingsProfilesDto, ConfigDto, AppLogoDto, UnitExportConfigDto, ProfilesRegistryDto
} from '@studio-lite-lib/api-dto';
import { ApiNotAcceptableResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { SettingService } from '../services/setting.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AppVersionGuard } from '../guards/app-version.guard';

@Controller('admin/settings')
export class SettingController {
  constructor(
    private settingService: SettingService,
    @Inject('APP_VERSION') readonly appVersion: string
  ) {}

  @Get('config')
  @UseGuards(AppVersionGuard)
  @ApiHeader({
    name: 'app-version',
    description: 'version of frontend',
    required: true,
    allowEmptyValue: false
  })
  @ApiOkResponse({ description: 'Config settings retrieved successfully.' }) // TODO Exception
  @ApiTags('admin settings')
  async findConfig(): Promise<ConfigDto> {
    return this.settingService.findConfig();
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Config settings updated successfully.' }) // TODO Exception?
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchConfig(@Body() settingData: ConfigDto) {
    return this.settingService.patchConfig(settingData);
  }

  @Get('app-logo')
  @ApiOkResponse({ description: 'App logo retrieved successfully.' }) // TODO Exception
  @ApiTags('admin settings')
  async findAppLogo(): Promise<AppLogoDto> {
    return this.settingService.findAppLogo();
  }

  @Patch('app-logo')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'App logo updated successfully.' }) // TODO Exception?
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchAppLogo(@Body() newLogo: AppLogoDto) {
    return this.settingService.patchAppLogo(newLogo);
  }

  @Get('unit-export-config')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Unit export config retrieved successfully.' }) // TODO Exception
  @ApiTags('admin settings')
  async findUnitExportConfig(): Promise<UnitExportConfigDto> {
    return this.settingService.findUnitExportConfig();
  }

  @Patch('unit-export-config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Unit export config updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchUnitExportConfig(@Body() newUnitExportConfig: UnitExportConfigDto) {
    return this.settingService.patchUnitExportConfig(newUnitExportConfig);
  }

  @Get('profiles-registry')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Profiles registry retrieved successfully.' })
  @ApiNotAcceptableResponse({ description: 'Profiles registry not acceptable.' })
  @ApiTags('admin settings')
  async findUnitProfilesRegistry(): Promise<ProfilesRegistryDto> {
    return this.settingService.findUnitProfilesRegistry();
  }

  @Patch('profiles-registry')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Profiles registry updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiNotAcceptableResponse({ description: 'Profiles registry not acceptable.' })
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchProfilesRegistry(@Body() newProfilesRegistry: ProfilesRegistryDto) {
    return this.settingService.patchProfilesRegistry(newProfilesRegistry);
  }

  @Get('missings-profiles')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Missings profiles config retrieved successfully.' }) // TODO Exception
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async findMissingsProfiles(): Promise<MissingsProfilesDto[]> {
    return this.settingService.findMissingsProfiles();
  }

  @Patch('missings-profiles')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Missings profiles config updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin settings')
  async patchMissingsProfiles(@Body() newMissingsProfiles: MissingsProfilesDto) {
    return this.settingService.patchMissingsProfiles(newMissingsProfiles);
  }
}
