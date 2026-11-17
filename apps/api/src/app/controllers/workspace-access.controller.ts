import {
  Body, Controller, Get, Patch, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiParam, ApiTags
} from '@nestjs/swagger';
import { UserWorkspaceAccessDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UsersService } from '../services/users.service';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { WorkspaceId } from '../decorators/workspace.decorator';

/**
 * `workspaces/:workspace_id/access` -- who may work in a workspace and at which access level, as
 * the admin of its group reads and sets it. The guard finds the group through the workspace.
 *
 * Not the same as {@link WorkspaceController}'s `users`, which tells the members who works here: this
 * one carries the access levels, and the addresses a user has not published, marked as hidden (#1216).
 */
@Controller('workspaces/:workspace_id/access')
@UseFilters(HttpExceptionFilter)
export class WorkspaceAccessController {
  constructor(private userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('workspace access')
  async findAll(@WorkspaceId() workspaceId: number): Promise<WorkspaceUserInListDto[]> {
    return this.userService.findAllUsers(workspaceId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Workspace users updated successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in group-admin.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace access')
  async patch(@WorkspaceId() workspaceId: number, @Body() users: UserWorkspaceAccessDto[]) {
    return this.userService.setUsersByWorkspace(workspaceId, users);
  }
}
