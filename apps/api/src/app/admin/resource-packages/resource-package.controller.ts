import {
  Controller, Delete, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import { Express } from 'express';
import 'multer';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResourcePackageService } from '../../database/services/resource-package.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin/resource-packages')
export class ResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Resource Packages retrieved successfully.' }) // TODO Exception
  @ApiTags('admin resource-packages')
  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    return this.resourcePackageService.findResourcePackages();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Resource Package deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiTags('admin resource-packages')
  async removeResourcePackage(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.resourcePackageService.removeResourcePackage(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('resourcePackage'))
  @ApiCreatedResponse({
    description: 'Sends back the id of the new resource package in database',
    type: Number
  })
  @ApiTags('admin resource-packages')
  async create(@UploadedFile() zippedResourcePackage: Express.Multer.File): Promise<number> {
    return this.resourcePackageService.create(zippedResourcePackage);
  }
}
