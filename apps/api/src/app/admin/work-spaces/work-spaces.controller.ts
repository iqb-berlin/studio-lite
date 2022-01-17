import {Controller, Get} from '@nestjs/common';

@Controller('super-admin/work-spaces')
export class WorkSpacesController {
  @Get()
  findAll(): string {
    return 'This action returns all work spaces';
  }
}
