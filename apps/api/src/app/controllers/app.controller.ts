import {
  Controller, Request, Get, Post, UseGuards, Patch, Body, UnauthorizedException
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { AuthDataDto, MyDataDto, ChangePasswordDto } from '@studio-lite-lib/api-dto';
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
import { BackgroundRequest } from '../decorators/background-request.decorator';

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
  async login(@Request() req, @Body('sessionId') sessionId?: string) {
    return this.authService.login(req.user, sessionId);
  }

  // Token rotation, no interaction.
  @BackgroundRequest()
  @Post('refresh')
  @ApiTags('auth')
  @ApiCreatedResponse({ description: 'Token successfully refreshed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  async refresh(@Body() body: { refreshToken: string }) {
    const tokens = await this.authService.refreshAccessToken(body.refreshToken);
    if (!tokens) throw new UnauthorizedException();
    return tokens;
  }

  // The session row is deleted a moment later; recording interaction on it first is a
  // write that races its own delete. Also matches how the frontend classifies it.
  @BackgroundRequest()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Logged out successfully.' })
  async logout(@Request() req, @UserId() userId: number, @Body() body: { refreshToken?: string }) {
    if (body?.refreshToken) {
      await this.authService.logoutCurrentSession(body.refreshToken, userId, req.user?.sessionId);
      return;
    }
    if (req.user?.sessionId) {
      await this.authService.logoutSession(userId, req.user.sessionId);
      return;
    }
    await this.authService.logout(userId);
  }

  // Unauthenticated sibling of logout: never carries a user, marked for symmetry.
  @BackgroundRequest()
  @Post('logout-silent')
  @ApiTags('auth')
  @ApiOkResponse({ description: 'Session logout handled silently.' })
  async logoutSilent(@Body() body: { refreshToken?: string }): Promise<void> {
    if (!body?.refreshToken) {
      return;
    }
    await this.authService.logoutCurrentSession(body.refreshToken);
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
    return this.authService.initLogin(body.username, body.password);
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

  // The handler itself records the interaction; the interceptor must not write twice.
  @BackgroundRequest()
  @Post('activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiTags('auth')
  @ApiOkResponse({ description: 'User activity updated.' })
  async activity(@Request() req): Promise<void> {
    await this.userService.updateLastActivity(req.user.id, req.user.sessionId);
  }

  // No liveness endpoint here on purpose. Two of them have been removed again: /ping,
  // whose job was to keep a session alive that the admin list's own poll kept alive
  // anyway (#1516), and /session-ping, which reported that a tab was still open so that
  // a closed browser could be called orphaned (#1569). The session status no longer asks
  // whether a browser is open -- it asks whether the session's tokens can still be used
  // (#1615) -- and nothing else read that signal.
}
