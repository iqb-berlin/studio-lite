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
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserDto, UserFullDto, UserInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import {UsersService} from "../../database/services/users.service";
import {AuthService} from "../../auth/service/auth.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {WorkspaceService} from "../../database/services/workspace.service";

@Controller('admin/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService,
    private authService: AuthService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserInListDto],
  })
  @ApiTags('admin users')
  async findAll(@Request() req): Promise<UserInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserFullDto],
  })
  @ApiTags('admin users')
  async findOne(@Request() req, @Param('id') id: number): Promise<UserFullDto> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.findOne(id);
  }

  @Get(':id/workspaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceInListDto],
  })
  @ApiTags('admin users')
  async findOnesWorkspaces(@Request() req, @Param('id') id: number): Promise<WorkspaceInListDto[]> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.workspaceService.findAll(id);
  }

  @Patch(':id/workspaces/:workspaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async patchOnesWorkspaces(@Request() req,
                           @Param('id') id: number,
                           @Param('workspaces') workspaces: string) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    const idsAsNumberArray: number[] = [];
    workspaces.split(';').forEach(s => idsAsNumberArray.push(parseInt(s)));
    return this.workspaceService.setWorkspacesByUser(id, idsAsNumberArray);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async remove(@Request() req, @Param('ids') ids: string): Promise<void> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s)));
    return this.usersService.remove(idsAsNumberArray);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number,
  })
  @ApiTags('admin users')
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.create(createUserDto)
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async patch(@Request() req, @Body() userFullDto: UserFullDto) {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.patch(userFullDto)
  }
}
