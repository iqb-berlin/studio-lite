import {
  BadRequestException, Controller, Get, Query, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MetadataProfileService } from '../services/metadata-profile.service';
import { RegisteredMetadataProfileService } from '../services/registered-metadata-profile.service';

/**
 * `metadata` -- the profiles and vocabularies the metadata forms are built from, served from the
 * studio's own cache rather than from w3id, so the form works while the outside is unreachable and
 * every user sees the same version.
 *
 * Read-only and not workspace-bound: which profile a workspace uses is part of its settings.
 */
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
  @ApiBadRequestResponse({ description: 'No url given.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve metadata profile.' })
  @ApiTags('metadata')
  async getMetadataProfileByUrl(@Query('url') url: string) {
    MetadataController.assertUrl(url);
    return this.metadataProfileService.getStoredMetadataProfile(url);
  }

  @Get('vocabularies')
  @ApiQuery({
    name: 'url',
    type: String
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of vocabularies retrieved successfully.' })
  @ApiBadRequestResponse({ description: 'No url given.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve vocabularies.' })
  @ApiTags('metadata')
  async getMetadataVocabulariesForProfile(@Query('url') url: string): Promise<MetadataVocabularyDto[]> {
    MetadataController.assertUrl(url);
    return this.metadataProfileService.getProfileVocabularies(url);
  }

  // The url is the id of the stored profile, and TypeORM throws on an undefined id (#2095)
  private static assertUrl(url: string | undefined): void {
    if (!url) throw new BadRequestException('The query parameter url is required.');
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
