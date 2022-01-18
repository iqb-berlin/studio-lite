import { Module } from '@nestjs/common';
import { WorkSpacesController } from './work-spaces/work-spaces.controller';
import { UsersController } from './users/users.controller';
import {DatabaseModule} from "../database/database.module";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [WorkSpacesController, UsersController]
})
export class AdminModule {}
