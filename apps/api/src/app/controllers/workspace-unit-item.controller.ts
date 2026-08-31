import {
  Body,
  Controller,
  Delete,
  Get, Param, ParseBoolPipe,
  Post, Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { UnitItemService } from '../services/unit-item.service';
import { WriteOrGroupAdminAccessGuard } from '../guards/write-or-group-admin-access.guard';
import { UnitId } from '../decorators/unit-id.decorator';
import UnitCommentUnitItem from '../entities/unit-comment-unit-item.entity';

/**
 * `workspaces/:workspace_id/units/:unit_id/items` -- the items of a unit: listing them, adding
 * one, removing one, and the comment links of all of them at once.
 *
 * Reading takes access to the workspace, writing takes write access, and deleting also lets the
 * group admin through -- an item may have to be removed by someone who administers the workspace
 * from outside.
 */
@Controller('workspaces/:workspace_id/units/:unit_id/items')
export class WorkspaceUnitItemController {
  constructor(
    private unitItemsService: UnitItemService
  ) {}

  /** All items of the unit. `withoutMetadata` leaves the metadata out, which is much the cheaper read. */
  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiTags('workspace unit item')
  async findAll(
    @UnitId() unitId: number,
      @Query('withoutMetadata', new ParseBoolPipe({ optional: true })) withoutMetadata: boolean
  ): Promise<UnitItemDto[] | UnitItemWithMetadataDto[]> {
    if (withoutMetadata) {
      return this.unitItemsService.getAllByUnitId(unitId);
    }
    return this.unitItemsService.getAllByUnitIdWithMetadata(unitId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiCreatedResponse({ description: 'Unit item created' })
  @ApiTags('workspace unit item')
  async create(
    @UnitId() unitId: number, @Body() body: UnitItemWithMetadataDto
  ): Promise<string> {
    return this.unitItemsService.addItem(unitId, body);
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard, WriteOrGroupAdminAccessGuard)
  @ApiBearerAuth()
  @ApiTags('workspace unit item')
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiQuery({
    name: 'uuid',
    type: String,
    isArray: false,
    required: true
  })
  async remove(@Param('uuid') uuid: string): Promise<void> {
    return this.unitItemsService.removeItem(uuid);
  }

  @Get('comments')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiTags('workspace unit item')
  async findItemCommentsByUnitId(@UnitId() unitId: number): Promise<UnitCommentUnitItem[]> {
    return this.unitItemsService.findItemCommentsByUnitId(unitId);
  }
}
