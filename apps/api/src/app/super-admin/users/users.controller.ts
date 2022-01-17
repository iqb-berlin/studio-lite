import {Controller, Get} from '@nestjs/common';

@Controller('super-admin/users')
export class UsersController {
  @Get()
  findAll(): string {
    return 'This action returns all users';
  }
}
