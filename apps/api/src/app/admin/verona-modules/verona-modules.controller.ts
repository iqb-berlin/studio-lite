import {
  Controller, Delete, Get, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { VeronaModulesService } from '../../database/services/verona-modules.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin/verona-modules')
export class VeronaModulesController {
  constructor(
    private veronaModulesService: VeronaModulesService
  ) {}

  @Get('download/:key')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona module retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Verona module not found.' })
  @ApiTags('verona-modules')
  async downloadModuleById(
    @Param('key') key: string,
      @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const fileData = await this.veronaModulesService.findFileById(key);
    res.set({
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`
    });
    return new StreamableFile(Buffer.from(fileData.file, 'utf8'));
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Verona module created successfully.',
    type: [VeronaModuleInListDto] // TODO: In anderen Fällen gibt die Api immer nur die ID bei Create zurück
  })
  @ApiNotAcceptableResponse({ description: 'Verona module not accepted.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiTags('admin verona-modules')
  async addModuleFile(@UploadedFile() file) {
    return this.veronaModulesService.upload(file.buffer);
  }

  // TODO: keys als query params umsetzen und eigenen endpunkt vermeiden
  @Delete(':keys')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules deleted successfully.' }) // TODO: Exception hinzufügen
  @ApiTags('admin verona-modules')
  async remove(@Param('keys') keys: string): Promise<void> {
    const keysAsStringArray: string[] = [];
    keys.split(';').forEach(s => keysAsStringArray.push(s));
    return this.veronaModulesService.remove(keysAsStringArray);
  }
}
