import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {UsersService} from "../../database/services/users.service";
import User from "../../database/entities/user.entity";
import {CreateUserDto, UserFullDto, UserInListDto} from "@studio-lite/api-admin";
import {ApiCreatedResponse, ApiParam, ApiTags} from "@nestjs/swagger";

@Controller('super-admin/users')
export class UsersController {
  constructor(
    private usersService: UsersService
  ) {}

  @Get()
  @ApiCreatedResponse({
    type: [UserInListDto],
  })
  @ApiTags('admin users')
  async findAll(): Promise<UserInListDto[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiCreatedResponse({
    type: [UserFullDto],
  })
  @ApiTags('admin users')
  async findOne(@Param('id') id: number): Promise<UserFullDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number,
  })
  @ApiTags('admin users')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }
}
