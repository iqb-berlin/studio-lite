import {
  Controller,
  Delete,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { ApiFile } from '../decorators/api-file.decorator';
import { fileMimetypeFilter } from '../utils/file-mimetype-filter';
import { ParseFile } from '../pipes/parse-file-pipe';

@Controller('admin/resource-packages')
export class AdminResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Resource Package deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiTags('admin resource-package')
  async removeResourcePackage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.resourcePackageService.removeResourcePackage(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin resource-package')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  @ApiOkResponse({ description: 'Admin resource-packages deleted successfully.' })
  async removeIds(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) id: number[]
  ) : Promise<void> {
    return this.resourcePackageService.removeResourcePackages(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiFile('resourcePackage', true, {
    fileFilter: fileMimetypeFilter('application/zip')
  })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new resource package in database',
    type: Number
  })
  @ApiTags('admin resource-package')
  async create(@UploadedFile(ParseFile) zippedResourcePackage: Express.Multer.File): Promise<number> {
    return this.resourcePackageService.create(zippedResourcePackage);
  }
}
