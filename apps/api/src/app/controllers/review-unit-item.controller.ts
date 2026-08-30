import {
  Controller,
  Get,
  ParseBoolPipe,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { UnitItemDto, UnitItemWithMetadataDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { UnitItemService } from '../services/unit-item.service';
import { UnitId } from '../decorators/unit-id.decorator';

/**
 * `reviews/:review_id/units/:unit_id/items` -- the items of a unit as a review shows them. The
 * same data the workspace serves under {@link WorkspaceUnitItemController}, reachable with a
 * review login instead of a workspace assignment.
 */
@Controller('reviews/:review_id/units/:unit_id/items')
export class ReviewUnitItemController {
  constructor(
    private unitItemsService: UnitItemService
  ) {}

  /** All items of the unit. `withoutMetadata` leaves the metadata out, which is much the cheaper read. */
  @Get()
  @UseGuards(JwtAuthGuard, ReviewGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiOkResponse()
  @ApiTags('review unit item')
  async findAll(
    @UnitId() unitId: number,
      @Query('withoutMetadata', new ParseBoolPipe({ optional: true })) withoutMetadata: boolean
  ): Promise<UnitItemDto[] | UnitItemWithMetadataDto[]> {
    if (withoutMetadata) {
      return this.unitItemsService.getAllByUnitId(unitId);
    }
    return this.unitItemsService.getAllByUnitIdWithMetadata(unitId);
  }
}
