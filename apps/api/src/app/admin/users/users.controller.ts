import {Body, Controller, Delete, Get, Param, Post, Request, UnauthorizedException, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from "@nestjs/swagger";
import {CreateUserDto, UserFullDto, UserInListDto} from "@studio-lite-lib/api-admin";
import {UsersService} from "../../database/services/users.service";
import {AuthService} from "../../auth/service/auth.service";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";

@Controller('admin/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiCreatedResponse({
    type: [UserFullDto],
  })
  @ApiTags('admin users')
  async findOne(@Request() req, @Param('id') id: number): Promise<UserFullDto> {
    console.log(req);
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    const isAdmin = await this.authService.isAdminUser(req);
    if (!isAdmin) {
      throw new UnauthorizedException();
    }
    return this.usersService.remove(id);
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
}
