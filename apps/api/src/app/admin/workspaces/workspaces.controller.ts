import {Body, Controller, Delete, Get, Param, Post, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {AuthService} from "../../auth/service/auth.service";
import {WorkspaceService} from "../../database/services/workspace.service";
import {CreateWorkspaceDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";

@Controller('admin/workspaces')
export class WorkspacesController {
  constructor(
    private workspacesService: WorkspaceService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceInListDto],
  })
  @ApiTags('admin workspaces')
  async findAll(@Request() req): Promise<WorkspaceInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspacesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiCreatedResponse({
    type: [WorkspaceFullDto],
  })
  @ApiTags('admin workspaces')
  async findOne(@Request() req, @Param('id') id: number): Promise<WorkspaceFullDto> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspacesService.findOne(id);
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
    return this.workspacesService.remove(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace in database',
    type: Number,
  })
  @ApiTags('admin workspaces')
  async create(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspacesService.create(createWorkspaceDto)
  }
}
