import {Body, Controller, Get, Param, Patch, Post, UseGuards} from '@nestjs/common';
import {UnitService} from "../database/services/unit.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUnitDto, UnitInListDto, UnitMetadataDto, WorkspaceFullDto} from "@studio-lite-lib/api-dto";
import {WorkspaceGuard} from "./workspace.guard";
import {WorkspaceId} from "./workspace.decorator";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";

@Controller('workspace/:workspace_id')
export class UnitsController {
  constructor(
    private unitService: UnitService
  ) {}

  @Get('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitInListDto]
  })
  @ApiTags('workspace')
  async findAll(@WorkspaceId() workspaceId: number): Promise<UnitInListDto[]> {
    return this.unitService.findAll(workspaceId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiTags('workspace unit')
  async findOnesMetadata(@WorkspaceId() workspaceId: number, @Param('id') unitId: number): Promise<UnitMetadataDto> {
    return this.unitService.findOnesMetadata(workspaceId, unitId);
  }

  @Patch(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchMetadata(@WorkspaceId() workspaceId: number,
                      @Param('id') unitId: number,
                      @Body() unitMetadataDto: UnitMetadataDto) {
    return this.unitService.patchMetadata(workspaceId, unitId, unitMetadataDto);
  }

  @Post('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new unit in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async create(@WorkspaceId() workspaceId: number,
               @Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(workspaceId, createUnitDto)
  }
}
