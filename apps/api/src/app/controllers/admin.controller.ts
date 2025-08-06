import {
  Controller, Get, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { UnitByDefinitionIdDto, WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';

@Controller('admin')
export class AdminController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {}

  @Get('workspaces')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async getAllWorkspaces(): Promise<WorkspaceFullDto[]> {
    return this.workspaceService.getAllWorkspaces();
  }

  @Get('units')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async getAllUnits(): Promise<UnitByDefinitionIdDto[]> {
    return this.unitService.getAllUnits();
  }
}
