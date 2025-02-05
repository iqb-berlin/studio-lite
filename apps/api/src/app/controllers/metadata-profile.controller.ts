import {
  Controller, Get, Query, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MetadataProfileService } from '../services/metadata-profile.service';
import { RegisteredMetadataProfileService } from '../services/registered-metadata-profile.service';

@Controller('metadata')
@UseFilters(HttpExceptionFilter)
export class MetadataProfileController {
  constructor(
    private metadataProfileService: MetadataProfileService,
    private registeredMetadataProfileService: RegisteredMetadataProfileService
  ) {
  }

  @Get('profiles')
  @ApiQuery({
    name: 'url',
    type: String
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMetadataProfileByUrl(@Query('url') url: string) {
    return this.metadataProfileService.getMetadataProfile(url);
  }

  @Get('vocabularies')
  @ApiQuery({
    name: 'url',
    type: String
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMetadataVocabulariesForProfile(@Query('url') url: string): Promise<MetadataVocabularyDto[]> {
    return this.metadataProfileService.getProfileVocabularies(url);
  }

  @Get('registry')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getRegistry() {
    return this.registeredMetadataProfileService.getRegisteredMetadataProfiles();
  }
}
