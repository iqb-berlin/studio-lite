import {Body, Controller, Get, Param, Post, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {UnitService} from "../database/services/unit.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUnitDto, UnitInListDto} from "@studio-lite-lib/api-dto";
import {AuthService} from "../auth/service/auth.service";

@Controller('workspace/:workspace_id/units')
export class UnitsController {
  constructor(
    private unitService: UnitService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UnitInListDto],
  })
  @ApiTags('workspace')
  async findAll(@Request() req, @Param('workspace_id') workspaceId: number): Promise<UnitInListDto[]> {
    const canAccess = await this.authService.canAccessWorkSpace(req, workspaceId);
    if (!canAccess) {
      throw new UnauthorizedException();
    }
    return this.unitService.findAll(workspaceId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number,
  })
  @ApiTags('workspace unit')
  async create(@Request() req,
               @Body() createUnitDto: CreateUnitDto,
               @Param('workspace_id') workspaceId: number) {
    const canAccess = await this.authService.canAccessWorkSpace(req, workspaceId);
    if (!canAccess) {
      throw new UnauthorizedException();
    }
    return this.unitService.create(workspaceId, createUnitDto)
  }
}
