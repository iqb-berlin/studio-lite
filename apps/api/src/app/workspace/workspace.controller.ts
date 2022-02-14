import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { WorkspaceFullDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';

@Controller('workspace/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(workspaceId);
  }
}
