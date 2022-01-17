import { Module } from '@nestjs/common';
import { WorkSpacesController } from './work-spaces/work-spaces.controller';
import { UsersController } from './users/users.controller';

@Module({
  controllers: [WorkSpacesController, UsersController]
})
export class SuperAdminModule {}
