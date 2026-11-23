import {
  Controller, Get, Param, ParseIntPipe, Res, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReadOrGroupAdminAccessGuard } from '../guards/read-or-group-admin-access.guard';
import { WorkspaceId } from '../decorators/workspace.decorator';

/**
 * The resource packages as a workspace sees them (#1358). Its modules get
 * `workspaces/<id>/packages/` as `directDownloadUrl` and append `<package name>/<path in the
 * package>` -- aspect `GeoGebra/GeoGebra/deployggb.js`, the lottie player `avatar/avatar.json`. The
 * package name is resolved to the package that serves it in this workspace's group.
 *
 * The files are served without a login, as `api/packages` serves them: a module loads them in its
 * iframe, script by script, and no such request carries a token.
 */
@Controller('workspaces/:workspace_id')
export class WorkspaceResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get('resource-packages')
  @UseGuards(JwtAuthGuard, ReadOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The package names units of this workspace can give and find served.' })
  @ApiTags('resource-package')
  async findPackageNames(@WorkspaceId() workspaceId: number): Promise<string[]> {
    return this.resourcePackageService.findPackageNamesForWorkspace(workspaceId);
  }

  @Get('packages/*path')
  @ApiOkResponse({ description: 'A file of the package that serves the package name in this workspace.' })
  @ApiNotFoundResponse({ description: 'No package serves the name, or it has no such file.' })
  @ApiTags('resource-package')
  async findPackageFile(
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Param('path') segments: string[] | string,
    @Res() res: Response
  ): Promise<void> {
    const found = await this.resourcePackageService.findPackageFile(
      workspaceId,
      Array.isArray(segments) ? segments : segments.split('/')
    );
    if (!found) {
      res.sendStatus(404);
      return;
    }
    // `root` keeps the path inside the package: a `..` that would leave it is refused, not followed
    res.sendFile(found.file, { root: found.root }, error => {
      if (error && !res.headersSent) res.sendStatus(404);
    });
  }
}
