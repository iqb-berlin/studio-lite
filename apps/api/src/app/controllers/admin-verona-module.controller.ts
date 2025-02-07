import {
  Controller,
  Delete,
  ParseArrayPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotAcceptableResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { VeronaModuleInListDto } from '@studio-lite-lib/api-dto';
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
  async addModuleFile(@UploadedFile() file) {
    return this.veronaModulesService.upload(file.buffer);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Verona modules deleted successfully.' })
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
