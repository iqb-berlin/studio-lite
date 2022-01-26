import {Controller, Get, Param, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {VeronaModuleInListDto} from "@studio-lite-lib/api-dto";
import {VeronaModulesService} from "../../database/services/verona-modules.service";
import {AuthService} from "../../auth/service/auth.service";

@Controller('admin/verona-modules')
export class VeronaModulesController {
  constructor(
    private veronaModuleService: VeronaModulesService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [VeronaModuleInListDto],
  })
  @ApiTags('admin verona-modules')
  async findAll(@Request() req): Promise<VeronaModuleInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.veronaModuleService.findAll();
  }

  @Get(':type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [VeronaModuleInListDto],
  })
  @ApiTags('admin verona-modules')
  async findAllByType(@Request() req, @Param('type') type: string): Promise<VeronaModuleInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.veronaModuleService.findAll(type);
  }


}
