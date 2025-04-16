import {
  Controller, Get, Query, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MetadataProfileService } from '../services/metadata-profile.service';
import { RegisteredMetadataProfileService } from '../services/registered-metadata-profile.service';

@Controller('metadata')
@UseFilters(HttpExceptionFilter)
export class MetadataController {
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
  @ApiOkResponse({ description: 'Metadata profile retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve metadata profile.' })
  @ApiTags('metadata')
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
  @ApiOkResponse({ description: 'List of vocabularies retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve vocabularies.' })
  @ApiTags('metadata')
  async getMetadataVocabulariesForProfile(@Query('url') url: string): Promise<MetadataVocabularyDto[]> {
    return this.metadataProfileService.getProfileVocabularies(url);
  }

  @Get('registry')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of registered metadata profiles retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve profile registry. ' })
  @ApiTags('metadata')
  async getRegistry() {
    return this.registeredMetadataProfileService.getRegisteredMetadataProfiles();
  }
}
