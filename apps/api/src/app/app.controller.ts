import {
  Controller, Request, Get, Post, UseGuards, Patch, Body, UnauthorizedException
} from '@nestjs/common';

import {
  ApiBearerAuth, ApiCreatedResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { AuthDataDto, ChangePasswordDto, MyDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/service/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkspaceService } from './database/services/workspace.service';
import { UsersService } from './database/services/users.service';
import { UserId, UserName } from './auth/user.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private userService: UsersService,
    private workspaceService: WorkspaceService
  ) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiTags('home')
  @ApiCreatedResponse({
    type: String
  })
  @ApiQuery({ type: String, name: 'password', required: true })
  @ApiQuery({ type: String, name: 'username', required: true })
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return `"${token}"`;
  }

  @Get('auth-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: AuthDataDto
  })
  @ApiTags('home')
  async findCanDos(@UserId() userId: number, @UserName() userName: string): Promise<AuthDataDto> {
    return <AuthDataDto>{
      userId: userId,
      userName: userName,
      isAdmin: await this.authService.isAdminUser(userId),
      workspaces: await this.workspaceService.findAllGroupwise(userId)
    };
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('home')
  async setPassword(@Request() req, @Body() passwords: ChangePasswordDto): Promise<boolean> {
    return this.userService.setPassword(req.user.id, passwords.oldPassword, passwords.newPassword);
  }

  @Get('my-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: MyDataDto
  })
  @ApiTags('home')
  async findMydata(@UserId() userId: number): Promise<MyDataDto> {
    return this.userService.findOne(userId).then(userData => <MyDataDto>{
      id: userData.id,
      lastName: userData.lastName,
      firstName: userData.firstName,
      email: userData.email,
      emailPublishApproved: userData.emailPublishApproved,
      description: userData.description
    });
  }

  @Patch('my-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('home')
  async setMyData(@Request() req, @Body() myNewData: MyDataDto): Promise<boolean> {
    if (req.user.id !== myNewData.id) throw new UnauthorizedException();
    await this.userService.patchMyData(myNewData);
    return true;
  }
}
