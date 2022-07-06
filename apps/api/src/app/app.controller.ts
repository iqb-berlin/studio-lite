import {
  Controller, Request, Get, Post, UseGuards, Patch, Body
} from '@nestjs/common';

import {
  ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { AuthDataDto, ChangePasswordDto } from '@studio-lite-lib/api-dto';
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
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Logged in successfully.' }) // TODO: Add Exception?
  @ApiQuery({ type: String, name: 'password', required: true })
  @ApiQuery({ type: String, name: 'username', required: true })
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return `"${token}"`;
  }

  @Get('auth-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User data successfully retrieved.' }) // TODO: Add Exception
  @ApiTags('auth')
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
  @ApiOkResponse({ description: 'Password successfully updated.' }) // TODO: Exception & Return Value entfernen
  @ApiTags('auth')
  async setPassword(@Request() req, @Body() passwords: ChangePasswordDto): Promise<boolean> {
    return this.userService.setPassword(req.user.id, passwords.oldPassword, passwords.newPassword);
  }
}
