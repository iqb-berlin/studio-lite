import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { UnitInViewDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { UnitService } from '../services/unit.service';

/**
 * `units` -- every unit of the installation, across all groups and workspaces, for administrators.
 * The units of one group are {@link WorkspaceGroupController}, those of one workspace
 * {@link WorkspaceUnitController}.
 */
@Controller('units')
export class UnitsController {
  constructor(
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Units retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('units')
  async findAll(): Promise<UnitInViewDto[]> {
    return this.unitService.getAllUnits();
  }
}
