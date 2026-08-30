import {
  Controller,
  Delete,
  NotAcceptableException,
  ParseArrayPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiQuery, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { VeronaModuleInListDto, VeronaModuleType } from '@studio-lite-lib/api-dto';
import { VERONA_MODULE_TYPES, isKnownVeronaModuleType } from '@studio-lite/shared-code';
import { FileInterceptor } from '@nestjs/platform-express';
import { VeronaModulesService } from '../services/verona-modules.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';

/**
 * `admin/verona-modules` -- installing and removing modules, for administrators only. The types a
 * module is installed as are given by the caller rather than read from the module, and are checked
 * here: an unknown type is refused with 406 instead of ending up in the database.
 */
@Controller('admin/verona-modules')
export class AdminVeronaModuleController {
  constructor(
    private veronaModulesService: VeronaModulesService
  ) {}

  /**
   * Installs an uploaded module under the given types. Types are trimmed, checked against the four
   * known ones in either spelling, and de-duplicated before the module is stored.
   */
  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Verona module created successfully.',
    type: [VeronaModuleInListDto]
  })
  @ApiNotAcceptableResponse({ description: 'Verona module not accepted.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('admin verona-module')
  @ApiQuery({
    name: 'type',
    type: String,
    // Both the current upper-case spelling and the legacy lower-case spelling are accepted.
    description: 'required, array of module types: EDITOR, PLAYER, SCHEMER, WIDGET',
    required: true,
    isArray: true,
    enum: VERONA_MODULE_TYPES
  })
  async addModuleFile(
  @UploadedFile() file,
    @Query('type', new ParseArrayPipe({ items: String, separator: ',' })) types: string[]
  ) {
    const normalizedTypes = types.map(type => type.trim()).filter(Boolean);

    if (!normalizedTypes.length) {
      throw new NotAcceptableException('Module type is required.');
    }

    const invalidTypes = normalizedTypes.filter(type => !isKnownVeronaModuleType(type));
    if (invalidTypes.length) {
      throw new NotAcceptableException(`Unknown module type(s): ${invalidTypes.join(', ')}`);
    }

    const uniqueTypes = Array.from(new Set(normalizedTypes)) as VeronaModuleType[];
    return this.veronaModulesService.upload(file.buffer, uniqueTypes);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin verona-module')
  @ApiQuery({
    name: 'key',
    type: String,
    isArray: true,
    required: true
  })
  async remove(
    @Query('key', new ParseArrayPipe({ items: String, separator: ',' })) keys: string[]
  ): Promise<void> {
    return this.veronaModulesService.remove(keys);
  }
}
