import {Body, Controller, Get, Patch, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {ConfigFullDto, WorkspaceFullDto} from "@studio-lite-lib/api-dto";
import {SettingService} from "../../database/services/setting.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {AuthService} from "../../auth/service/auth.service";

@Controller('admin/settings')
export class SettingController {
  constructor(
    private settingService: SettingService,
    private authService: AuthService
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin settings')
  async patchConfig(@Request() req, @Body() settingData: ConfigFullDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.settingService.patchConfig(settingData)
  }
}
