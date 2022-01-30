import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {UnitService} from "../database/services/unit.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUnitDto, UnitInListDto} from "@studio-lite-lib/api-dto";
import {WorkspaceGuard} from "./workspace.guard";
import {WorkspaceId} from "./workspace.decorator";

@Controller('workspace/:workspace_id/units')
export class UnitsController {
  constructor(
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UnitInListDto],
  })
  @ApiTags('workspace')
  async findAll(@WorkspaceId() workspaceId: number): Promise<UnitInListDto[]> {
    return this.unitService.findAll(workspaceId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new unit in database',
    type: Number,
  })
  @ApiTags('workspace unit')
  async create(@WorkspaceId() workspaceId: number,
               @Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(workspaceId, createUnitDto)
  }
}
