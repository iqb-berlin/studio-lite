import {Controller, Get, Post, UploadedFiles, UseGuards, UseInterceptors} from '@nestjs/common';
import {WorkspaceService} from "../database/services/workspace.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {WorkspaceGuard} from "./workspace.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {WorkspaceFullDto} from "@studio-lite-lib/api-dto";
import {WorkspaceId} from "./workspace.decorator";
import {ApiImplicitParam} from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";
import {FilesInterceptor} from "@nestjs/platform-express";

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
    type: WorkspaceFullDto,
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(workspaceId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiTags('workspace')
  async addModuleFile(@WorkspaceId() workspaceId: number, @UploadedFiles() files) {
    this.workspaceService.uploadUnits(workspaceId, files);
  }
}
