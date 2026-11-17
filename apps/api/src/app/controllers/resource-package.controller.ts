import {
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageService } from '../services/resource-package.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { ApiFile } from '../decorators/api-file.decorator';
import { fileMimetypeFilter } from '../filters/file-mimetype.filter';
import { ParseFilePipe } from '../pipes/parse-file.pipe';
import { ZIP_MIME_TYPES } from '../constants/zip-mime-types';

/**
 * `resource-packages` -- the installed resource packages. The list is readable by every logged-in
 * user because any workspace's units may draw on them. Installing and removing one is an
 * installation-wide act and therefore an administrator's; an upload is a zip and is refused with
 * 415 if it is not.
 */
@Controller('resource-packages')
export class ResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Resource Packages retrieved successfully.' })
  @ApiTags('resource-package')
  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    return this.resourcePackageService.findResourcePackages();
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('resource-package')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  @ApiOkResponse({ description: 'Resource-packages deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  async removeIds(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) id: number[]
  ) : Promise<void> {
    return this.resourcePackageService.removeResourcePackages(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiFile('resourcePackage', true, {
    fileFilter: fileMimetypeFilter(...ZIP_MIME_TYPES)
  })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new resource package in database',
    type: Number
  })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('resource-package')
  async create(@UploadedFile(ParseFilePipe) zippedResourcePackage: Express.Multer.File): Promise<number> {
    return this.resourcePackageService.create(zippedResourcePackage);
  }
}
