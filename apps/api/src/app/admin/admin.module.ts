import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import {DatabaseModule} from "../database/database.module";
import {AuthModule} from "../auth/auth.module";
import {WorkspacesController} from "./workspaces/workspaces.controller";
import {WorkspaceGroupsController} from "./workspaces/workspace-groups.controller";

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [WorkspacesController, UsersController, WorkspaceGroupsController]
})
export class AdminModule {}
