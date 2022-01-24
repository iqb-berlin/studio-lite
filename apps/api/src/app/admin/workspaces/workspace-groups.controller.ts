import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import {AuthService} from "../../auth/service/auth.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {WorkspaceGroupService} from "../../database/services/workspace-group.service";
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto
} from "@studio-lite-lib/api-admin";

@Controller('admin/workspace-groups')
export class WorkspaceGroupsController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupInListDto],
  })
  @ApiTags('admin workspaces')
  async findAll(@Request() req): Promise<WorkspaceGroupInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceGroupService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupFullDto],
  })
  @ApiTags('admin workspaces')
  async findOne(@Request() req, @Param('id') id: number): Promise<WorkspaceGroupFullDto> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceGroupService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceGroupService.remove(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patch(@Request() req, @Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceGroupService.patch(workspaceGroupFullDto)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace group in database',
    type: Number,
  })
  @ApiTags('admin workspaces')
  async create(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceGroupDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceGroupService.create(createWorkspaceDto)
  }
}
