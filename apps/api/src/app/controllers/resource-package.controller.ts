import {
  Controller,
  Get
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import 'multer';
import { ResourcePackageDto } from '@studio-lite-lib/api-dto';
import { ResourcePackageService } from '../services/resource-package.service';

@Controller('resource-packages')
export class ResourcePackageController {
  constructor(
    private resourcePackageService: ResourcePackageService
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Resource Packages retrieved successfully.' }) // TODO Exception
  @ApiTags('resource-package')
  async findResourcePackages(): Promise<ResourcePackageDto[]> {
    return this.resourcePackageService.findResourcePackages();
  }
}
