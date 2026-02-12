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
import { FileInterceptor } from '@nestjs/platform-express';
import { VeronaModulesService } from '../services/verona-modules.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';

@Controller('admin/verona-modules')
export class AdminVeronaModuleController {
  constructor(
    private veronaModulesService: VeronaModulesService
  ) {}

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
    description: 'required, array of module types: editor, player, schemer, widget',
    required: true,
    isArray: true,
    enum: ['editor', 'player', 'schemer', 'widget']
  })
  async addModuleFile(
  @UploadedFile() file,
    @Query('type', new ParseArrayPipe({ items: String, separator: ',' })) types: string[]
  ) {
    const allowedTypes = ['editor', 'player', 'schemer', 'widget'] as const;
    const normalizedTypes = types.map(type => type.trim()).filter(Boolean);

    if (!normalizedTypes.length) {
      throw new NotAcceptableException('Module type is required.');
    }

    const invalidTypes = normalizedTypes.filter(type => !allowedTypes.includes(type as VeronaModuleType));
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
