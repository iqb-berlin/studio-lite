import {Body, Controller, Get, Patch, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {ConfigFullDto} from "@studio-lite-lib/api-dto";
import {SettingService} from "../../database/services/setting.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {IsAdminGuard} from "../is-admin.guard";

@Controller('admin/settings')
export class SettingController {
  constructor(
    private settingService: SettingService,
  ) {}

  @Get('config')
  @ApiCreatedResponse({
    type: ConfigFullDto,
  })
  @ApiTags('admin settings')
  async findConfig(): Promise<ConfigFullDto> {
    return this.settingService.findConfig()
  }

  @Patch('config')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchConfig(@Body() settingData: ConfigFullDto) {
    return this.settingService.patchConfig(settingData)
  }
}
