import {Controller, Request, Get, Post, UseGuards, UnauthorizedException} from '@nestjs/common';

import { AppService } from './app.service';
import {LocalAuthGuard} from "./auth/local-auth.guard";
import {AuthService} from "./auth/service/auth.service";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {ApiBearerAuth, ApiCreatedResponse, ApiParam, ApiQuery, ApiTags} from "@nestjs/swagger";
import {WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import {AuthDataDto} from "@studio-lite-lib/api-start";
import {WorkspaceService} from "./database/services/workspace.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private workspaceService: WorkspaceService
) {}

  @UseGuards(LocalAuthGuard)
  @ApiTags('auth')
  @ApiCreatedResponse({
    type: String
  })
  @ApiQuery({ type: String, name: 'password', required: true })
  @ApiQuery({ type: String, name: 'username', required: true })
  @Post('login')
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return `"${token}"`;
  }

  @Get('auth-data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: AuthDataDto,
  })
  @ApiTags('auth')
  async findCanDos(@Request() req): Promise<AuthDataDto> {
    return <AuthDataDto>{
      userId: req.user.id,
      userName: await this.authService.getMyName(req.user.id),
      isAdmin: await this.authService.isAdminUser(req),
      workspaces: await this.workspaceService.findAllGroupwise(req.user.id)
    }
  }
}
