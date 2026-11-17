import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { UnitItemInViewDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { UnitItemService } from '../services/unit-item.service';

/**
 * `unit-items` -- every item of every unit in the installation, for administrators. The items of one
 * group are {@link WorkspaceGroupController}, those of one unit {@link WorkspaceUnitItemController}.
 */
@Controller('unit-items')
export class UnitItemsController {
  constructor(
    private unitItemService: UnitItemService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Unit items retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('unit-items')
  async findAll(): Promise<UnitItemInViewDto[]> {
    return this.unitItemService.getAll();
  }
}
