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
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { UnitItemService } from '../services/unit-item.service';
import { UnitId } from '../decorators/unit-id.decorator';

@Controller('workspaces/:workspace_id/units/:unit_id/items')
export class UnitItemController {
  constructor(
    private unitItemsService: UnitItemService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiTags('unit item')
  async findAll(@UnitId() unitId: number): Promise<UnitItemDto[]> {
    return this.unitItemsService.getAllByUnitIdWithMetadata(unitId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiCreatedResponse({ description: 'Unit item created' })
  @ApiTags('unit item')
  async create(
    @UnitId() unitId: number, @Body() body: UnitItemWithMetadataDto
  ): Promise<string> {
    return this.unitItemsService.addItem(unitId, body);
  }

  @Delete(':uuid')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiTags('unit item')
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
}
