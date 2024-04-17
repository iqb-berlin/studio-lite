import {
  Controller, Get, Query, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MetadataProfileService } from '../database/services/metadata-profile.service';

@Controller('metadata-profile')
@UseFilters(HttpExceptionFilter)
export class MetadataProfileController {
  constructor(
    private metadataProfileService: MetadataProfileService
  ) {
  }

  @Get()
  @ApiQuery({
    name: 'url',
    type: String
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMetadataProfileByUrl(@Query('url') url: string) {
    return this.metadataProfileService.getMetadataProfile(url);
  }
}
