import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {WorkspaceService} from "../../database/services/workspace.service";
import {WorkspaceGroupDto, CreateWorkspaceDto, UserInListDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-dto";
import {UsersService} from "../../database/services/users.service";
import {IsAdminGuard} from "../is-admin.guard";

@Controller('admin/workspaces')
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceInListDto],
  })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAll();
  }

  @Get('groupwise')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupDto],
  })
  @ApiTags('admin workspaces')
  async findAllGroupwise(): Promise<WorkspaceGroupDto[]> {
    return this.workspaceService.findAllGroupwise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceFullDto],
  })
  @ApiTags('admin workspaces')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async remove(@Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s)));
    return this.workspaceService.remove(idsAsNumberArray);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace in database',
    type: Number,
  })
  @ApiTags('admin workspaces')
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto)
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceFullDto: WorkspaceFullDto) {
    return this.workspaceService.patch(workspaceFullDto)
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserInListDto],
  })
  @ApiTags('admin workspaces')
  async findOnesUsers(@Param('id') id: number): Promise<UserInListDto[]> {
    return this.userService.findAll(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesUsers(@Param('id') id: number,
                       @Body() users: number[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }
}
