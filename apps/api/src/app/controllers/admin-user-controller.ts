import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  CreateUserDto, IdArrayDto,
  UserFullDto, WorkspaceGroupInListDto
} from "@studio-lite-lib/api-dto";
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';

@Controller('admin/users')
export class AdminUserController {
  constructor(
    private usersService: UsersService,
    private workspaceGroupService: WorkspaceGroupService
  ) {}

  @Get(':id/workspace-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupInListDto]
  })
  @ApiTags('admin user')
  async findOnesWorkspaceGroups(@Param('id') id: number): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll(id);
  }

  @Patch(':id/workspace-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin user')
  async patchOnesWorkspaceGroups(@Param('id') id: number,
    @Body() body: IdArrayDto): Promise<void> {
    return this.workspaceGroupService.setWorkspaceGroupAdminsByUser(id, body.ids);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin user')
  @ApiOkResponse({ description: 'Users deleted successfully.' })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@Query('id') ids: number[]): Promise<void> {
    return this.usersService.remove(ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number
  })
  @ApiTags('admin user')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin user')
  async patch(@Body() userFullDto: UserFullDto) {
    return this.usersService.patch(userFullDto);
  }
}
