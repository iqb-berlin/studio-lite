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
import { UnitItemService } from '../services/unit-item.service';
import { UnitId } from '../decorators/unit-id.decorator';

@Controller('reviews/:review_id/units/:unit_id/items')
export class ReviewUnitItemController {
  constructor(
    private unitItemsService: UnitItemService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
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
