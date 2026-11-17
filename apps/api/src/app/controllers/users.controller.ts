import {
  Controller, Get, ParseBoolPipe, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { UserFullDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { BackgroundRequest } from '../decorators/background-request.decorator';
import { AnyWorkspaceGroupAdmin } from '../decorators/any-workspace-group-admin.decorator';

/**
 * `users` -- the users of the installation, for whoever administers it or any of its groups.
 *
 * The list is served whole, not narrowed to a group: a group admin has to be able to pick anyone to
 * add. So no group stands in the path, and the route says with {@link AnyWorkspaceGroupAdmin} that
 * administering any group is enough. Which workspaces of a group a user may work in is
 * {@link WorkspaceGroupUserController}.
 */
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Polled every 15 s by the admin user list; an open list must not keep its own
  // session alive. The same route serves the user-triggered refresh, which declares
  // intent per request -- a route marking alone cannot tell the two apart.
  @BackgroundRequest('unless-user-intent')
  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Users retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No group-admin privileges.' })
  @ApiTags('users')
  @ApiQuery({
    name: 'full',
    type: Boolean,
    required: false
  })
  async findAll(@Query('full',
    new ParseBoolPipe({ optional: true })) full?: boolean): Promise<WorkspaceUserInListDto[] | UserFullDto[]> {
    if (full) {
      return this.usersService.findAllFull();
    }
    return this.usersService.findAllUsers();
  }
}
