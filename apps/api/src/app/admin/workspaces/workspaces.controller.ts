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
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {AuthService} from "../../auth/service/auth.service";
import {WorkspaceService} from "../../database/services/workspace.service";
import {WorkspaceGroupDto, CreateWorkspaceDto, UserInListDto, WorkspaceFullDto, WorkspaceInListDto} from "@studio-lite-lib/api-dto";
import {UsersService} from "../../database/services/users.service";

@Controller('admin/workspaces')
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService,
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
    return this.workspaceService.findAll();
  }

  @Get('groupwise')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupDto],
  })
  @ApiTags('admin workspaces')
  async findAllGroupwise(@Request() req): Promise<WorkspaceGroupDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceService.findAllGroupwise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceFullDto],
  })
  @ApiTags('admin workspaces')
  async findOne(@Request() req, @Param('id') id: number): Promise<WorkspaceFullDto> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceService.findOne(id);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async remove(@Request() req, @Param('ids') ids: string): Promise<void> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s)));
    return this.workspaceService.remove(idsAsNumberArray);
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
    return this.workspaceService.create(createWorkspaceDto)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patch(@Request() req, @Body() workspaceFullDto: WorkspaceFullDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceService.patch(workspaceFullDto)
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserInListDto],
  })
  @ApiTags('admin workspaces')
  async findOnesUsers(@Request() req, @Param('id') id: number): Promise<UserInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.userService.findAll(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesUsers(@Request() req,
                       @Param('id') id: number,
                       @Body() users: number[]) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.userService.setUsersByWorkspace(id, users);
  }
}
