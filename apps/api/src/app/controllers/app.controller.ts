import {
  Controller, Request, Get, Post, UseGuards, Patch, Body, UnauthorizedException, Query, Param
} from '@nestjs/common';

import {
  ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  AuthDataDto,
  VeronaModuleFileDto,
  VeronaModuleInListDto
  // eslint-disable-next-line import/no-duplicates, import/order
} from '@studio-lite-lib/api-dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { AuthService } from '../auth/service/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceService } from '../database/services/workspace.service';
import { UsersService } from '../database/services/users.service';
import { ReviewId } from '../auth/review-id.decorator';
import { UserId } from '../auth/user-id.decorator';
import { UserName } from '../auth/user-name.decorator';
import { ReviewService } from '../database/services/review.service';
import { AppVersionGuard } from '../guards/app-version.guard';
import { VeronaModulesService } from '../database/services/verona-modules.service';
// eslint-disable-next-line import/no-duplicates, import/order
import { CreateUserDto } from '@studio-lite-lib/api-dto';
// eslint-disable-next-line import/no-duplicates, import/order
import { MyDataDto } from '@studio-lite-lib/api-dto';
// eslint-disable-next-line import/no-duplicates, import/order
import { ChangePasswordDto } from '@studio-lite-lib/api-dto';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private workspaceService: WorkspaceService,
    private reviewService: ReviewService,
    private veronaModulesService: VeronaModulesService
  ) {
  }

  @Post('login')
  @UseGuards(LocalAuthGuard, AppVersionGuard)
  @ApiTags('auth')
  @ApiHeader({
    name: 'app-version',
    description: 'version of frontend',
    required: true,
    allowEmptyValue: false
  })
  @ApiOkResponse({ description: 'Logged in successfully.' }) // TODO: Add Exception?
  async login(@Request() req) {
    const token = await this.authService.login(req.user);
    return `"${token}"`;
  }

  @Post('init-login')
  @UseGuards(AppVersionGuard)
  @ApiHeader({
    name: 'app-version',
    description: 'version of frontend',
    required: true,
    allowEmptyValue: false
  })
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Created first login and logged in so successfully.' }) // TODO: Add Exception?
  async initLogin(@Body() body: { username: string, password: string }
  ) {
    const token = await this.authService.initLogin(body.username, body.password);
    return `"${token}"`;
  }

  @Post('keycloak-login')
  @UseGuards(AppVersionGuard)
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Keycloak login successful.' })
  async keycloakLogin(@Body() user: CreateUserDto) {
    const token = await this.authService.keycloakLogin(user);
    return `"${token}"`;
  }

  @Get('auth-data')
  @UseGuards(JwtAuthGuard, AppVersionGuard)
  @ApiHeader({
    name: 'app-version',
    description: 'version of frontend',
    required: true,
    allowEmptyValue: false
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User auth data successfully retrieved.' }) // TODO: Add Exception
  @ApiTags('auth')
  async findCanDos(
    @UserId() userId: number, @UserName() userName: string, @ReviewId() reviewId: number
  ): Promise<AuthDataDto> {
    if (userId) {
      return <AuthDataDto>{
        userId: userId,
        userName: userName,
        userLongName: await this.userService.getLongName(userId),
        isAdmin: await this.authService.isAdminUser(userId),
        workspaces: await this.workspaceService.findAllGroupwise(userId),
        reviews: await this.reviewService.findAllByUser(userId)
      };
    }
    return <AuthDataDto>{
      userId: 0,
      userName: '',
      isAdmin: false,
      workspaces: [],
      reviews: [await this.reviewService.findOneForAuth(reviewId)]
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

  @Get('my-data')
  @UseGuards(JwtAuthGuard, AppVersionGuard)
  @ApiHeader({
    name: 'app-version',
    description: 'version of frontend',
    required: true,
    allowEmptyValue: false
  })
  @ApiBearerAuth()
  // TODO: Exception & Return Value entfernen
  @ApiOkResponse({ description: 'User personal data successfully retrieved.' })
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
  // TODO: Exception & Return Value entfernen
  @ApiOkResponse({ description: 'User personal data successfully updated.' })
  @ApiTags('home')
  async setMyData(@Request() req, @Body() myNewData: MyDataDto): Promise<boolean> {
    if (req.user.id !== myNewData.id) throw new UnauthorizedException();
    await this.userService.patchMyData(myNewData);
    return true;
  }

  @Get('verona-modules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'type',
    type: String,
    description: 'specify the type of module if needed: schemer, editor, player',
    required: false
  })
  @ApiOkResponse({ description: 'Verona modules retrieved successfully.' })
  @ApiTags('verona-modules')
  async findAllByType(@Query('type') type: string): Promise<VeronaModuleInListDto[]> {
    return this.veronaModulesService.findAll(type);
  }

  @Get('verona-module/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona module retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Verona module not found.' })
  @ApiTags('verona-modules')
  async findFileById(@Param('key') key: string): Promise<VeronaModuleFileDto> {
    return this.veronaModulesService.findFileById(key);
  }
}
