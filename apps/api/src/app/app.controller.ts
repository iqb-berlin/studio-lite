import {Controller, Request, Get, Post, UseGuards} from '@nestjs/common';

import { AppService } from './app.service';
import {LocalAuthGuard} from "./auth/local-auth.guard";
import {AuthService} from "./auth/service/auth.service";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import {ApiCreatedResponse, ApiParam, ApiQuery} from "@nestjs/swagger";
import {UserInListDto} from "@studio-lite-lib/api-admin";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService
) {}

  @UseGuards(LocalAuthGuard)
  @ApiCreatedResponse({
    type: String
  })
  @ApiQuery({ type: String, name: 'password', required: true })
  @ApiQuery({ type: String, name: 'username', required: true })
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Get('doc')
  getData() {
    return this.appService.getData();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
