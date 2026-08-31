import {
  Body,
  Controller,
  Delete,
  Get, Param,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { UnitItemMetadataService } from '../services/unit-item-metadata.service';
import { ItemUuid } from '../decorators/item-uuid.decorator';

/**
 * `workspaces/:workspace_id/units/:unit_id/items/:item_uuid/metadata` -- the metadata rows of one
 * item, one per profile. Reading takes access to the workspace, writing takes write access.
 *
 * These routes address a single row; the whole metadata of a unit and all its items is saved in
 * one transaction through {@link WorkspaceUnitController}, which is what the metadata form uses.
 */
@Controller('workspaces/:workspace_id/units/:unit_id/items/:item_uuid/metadata')
export class UnitItemMetadataController {
  constructor(
    private unitItemMetadataService: UnitItemMetadataService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'item_uuid', type: String })
  @ApiOkResponse()
  @ApiTags('item metadata')
  async findAll(@ItemUuid() itemUuid: string): Promise<UnitItemMetadataDto[]> {
    return this.unitItemMetadataService.getAllByItemId(itemUuid);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'item_uuid', type: String })
  @ApiCreatedResponse({ description: 'Unit item created' })
  @ApiTags('item metadata')
  async create(
    @ItemUuid() itemUuid: string, @Body() body: UnitItemMetadataDto
  ): Promise<number> {
    return this.unitItemMetadataService.addItemMetadata(itemUuid, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiTags('item metadata')
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'item_uuid', type: String })
  @ApiOkResponse()
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@Param('id') id: number): Promise<void> {
    return this.unitItemMetadataService.removeItemMetadata(id);
  }
}
