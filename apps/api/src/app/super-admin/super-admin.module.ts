import { Module } from '@nestjs/common';
import { WorkSpacesController } from './work-spaces/work-spaces.controller';
import { UsersController } from './users/users.controller';
import {DatabaseModule} from "../database/database.module";

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [WorkSpacesController, UsersController]
})
export class SuperAdminModule {}
