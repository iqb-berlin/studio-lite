import {Controller, Get, UseGuards} from '@nestjs/common';
import {UnitService} from "../database/services/unit.service";
import {WorkspaceService} from "../database/services/workspace.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {WorkspaceGuard} from "./workspace.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {UnitInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-dto";
import {WorkspaceId} from "./workspace.decorator";

@Controller('workspace/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: WorkspaceInListDto,
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceInListDto> {
    return this.workspaceService.find(workspaceId);
  }
}
