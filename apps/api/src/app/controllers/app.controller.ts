import {
  Controller, Request, Get, Post, UseGuards, Patch, Body, UnauthorizedException
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  AuthDataDto
  // eslint-disable-next-line import/no-duplicates, import/order
} from '@studio-lite-lib/api-dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { ReviewId } from '../decorators/review-id.decorator';
import { UserId } from '../decorators/user-id.decorator';
import { UserName } from '../decorators/user-name.decorator';
import { ReviewService } from '../services/review.service';
import { AppVersionGuard } from '../guards/app-version.guard';
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
    private reviewService: ReviewService
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
  @ApiCreatedResponse({ description: 'Logged in successfully.' }) // TODO: Add Exception?
  @ApiUnauthorizedResponse({ description: 'The user is not registered. ' })
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
  @ApiCreatedResponse({ description: 'Created first login and logged in so successfully.' }) // TODO: Add Exception?
  @ApiForbiddenResponse({ description: 'First user already created.' })
  async initLogin(@Body() body: { username: string, password: string }
  ) {
    const token = await this.authService.initLogin(body.username, body.password);
    return `"${token}"`;
  }

  @Post('keycloak-login')
  @UseGuards(AppVersionGuard)
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Keycloak login successful.' })
  @ApiInternalServerErrorResponse({ description: 'The body request has wrong format.' })
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
  @ApiUnauthorizedResponse({ description: 'User is not authorized.' })
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
  @ApiUnauthorizedResponse({ description: 'User is not authorized to update password.' })
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
  @ApiUnauthorizedResponse({ description: 'The token, and user_id do not match.' })
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
  @ApiUnauthorizedResponse({ description: 'The token, and user_id do not match.' })
  @ApiTags('home')
  async setMyData(@Request() req, @Body() myNewData: MyDataDto): Promise<boolean> {
    if (req.user.id !== myNewData.id) throw new UnauthorizedException();
    await this.userService.patchMyData(myNewData);
    return true;
  }
}
