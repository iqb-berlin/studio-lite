import {
  Body, Controller, Get, Inject, Patch, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiHeader, ApiNotAcceptableResponse, ApiOkResponse, ApiQuery, ApiTags,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import {
  MissingsProfilesDto, ConfigDto, AppLogoDto, UnitExportConfigDto, ProfilesRegistryDto,
  EmailTemplateDto, UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { SettingService } from '../services/setting.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { AppVersionGuard } from '../guards/app-version.guard';

/**
 * `settings` -- the installation-wide settings: the config, the logo, the export configuration, the
 * profile registry, the mail template, the missings profiles, the rich-note tags. Each is a GET and
 * a PATCH. The tags are read in two forms: `unit-rich-note-tags` answers the tags they resolve to
 * for a group, `unit-rich-note-tags-config` the stored configuration itself, which is also what
 * the PATCH writes.
 *
 * Every PATCH is an administrator's, the GETs are not all. `config` and `app-logo` have to answer
 * before anyone has logged in and therefore carry no token guard -- `config` is guarded by the app
 * version alone, which is what makes it the route that sends a stale frontend to reload. The
 * settings only an administrator ever reads, the mail template and the tag configuration, are
 * guarded on the way in as well.
 */
@Controller('settings')
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
  @ApiTags('settings')
  async findConfig(): Promise<ConfigDto> {
    return this.settingService.findConfig();
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Config settings updated successfully.' }) // TODO Exception?
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchConfig(@Body() settingData: ConfigDto) {
    return this.settingService.patchConfig(settingData);
  }

  @Get('app-logo')
  @ApiOkResponse({ description: 'App logo retrieved successfully.' }) // TODO Exception
  @ApiTags('settings')
  async findAppLogo(): Promise<AppLogoDto> {
    return this.settingService.findAppLogo();
  }

  @Patch('app-logo')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'App logo updated successfully.' }) // TODO Exception?
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchAppLogo(@Body() newLogo: AppLogoDto) {
    return this.settingService.patchAppLogo(newLogo);
  }

  @Get('unit-export-config')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Unit export config retrieved successfully.' }) // TODO Exception
  @ApiTags('settings')
  async findUnitExportConfig(): Promise<UnitExportConfigDto> {
    return this.settingService.findUnitExportConfig();
  }

  @Patch('unit-export-config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Unit export config updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchUnitExportConfig(@Body() newUnitExportConfig: UnitExportConfigDto) {
    return this.settingService.patchUnitExportConfig(newUnitExportConfig);
  }

  @Get('profiles-registry')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Profiles registry retrieved successfully.' })
  @ApiNotAcceptableResponse({ description: 'Profiles registry not acceptable.' })
  @ApiTags('settings')
  async findUnitProfilesRegistry(): Promise<ProfilesRegistryDto> {
    return this.settingService.findUnitProfilesRegistry();
  }

  @Patch('profiles-registry')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Profiles registry updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiNotAcceptableResponse({ description: 'Profiles registry not acceptable.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchProfilesRegistry(@Body() newProfilesRegistry: ProfilesRegistryDto) {
    return this.settingService.patchProfilesRegistry(newProfilesRegistry);
  }

  @Get('email-template')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Email template retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('settings')
  async findEmailTemplate(): Promise<EmailTemplateDto> {
    return this.settingService.findEmailTemplate();
  }

  @Patch('email-template')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Email template updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchEmailTemplate(@Body() newEmailTemplate: EmailTemplateDto) {
    return this.settingService.patchEmailTemplate(newEmailTemplate);
  }

  @Get('missings-profiles')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Missings profiles config retrieved successfully.' }) // TODO Exception
  @ApiBearerAuth()
  @ApiTags('settings')
  async findMissingsProfiles(): Promise<MissingsProfilesDto[]> {
    return this.settingService.findMissingsProfiles();
  }

  @Patch('missings-profiles')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Missings profiles config updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('settings')
  async patchMissingsProfiles(@Body() newMissingsProfiles: MissingsProfilesDto) {
    return this.settingService.patchMissingsProfiles(newMissingsProfiles);
  }

  @Get('unit-rich-note-tags')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'workspaceGroupId', type: Number, required: false })
  @ApiOkResponse({ description: 'Unit rich note tags retrieved successfully.' })
  @ApiTags('settings')
  async findUnitRichNoteTags(@Query('workspaceGroupId') workspaceGroupId?: number): Promise<UnitRichNoteTagDto[]> {
    return this.settingService.findUnitRichNoteTags(workspaceGroupId ? Number(workspaceGroupId) : undefined);
  }

  @Get('unit-rich-note-tags-config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Unit rich note tags config retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async findUnitRichNoteTagsConfig(): Promise<UnitRichNoteTagDto[] | string[]> {
    return this.settingService.findUnitRichNoteTagsConfig();
  }

  @Patch('unit-rich-note-tags-config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'Unit rich note tags updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiBearerAuth()
  @ApiTags('settings')
  async patchUnitRichNoteTags(@Body() newTags: UnitRichNoteTagDto[] | string) {
    return this.settingService.patchUnitRichNoteTags(newTags);
  }
}
