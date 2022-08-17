import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users/users.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesController } from './workspaces/workspaces.controller';
import { WorkspaceGroupsController } from './workspaces/workspace-groups.controller';
import { SettingController } from './settings/setting.controller';
import { VeronaModulesController } from './verona-modules/verona-modules.controller';
import { ResourcePackageController } from './resource-packages/resource-package.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    MulterModule
  ],
  controllers: [
    WorkspacesController,
    UsersController,
    WorkspaceGroupsController,
    SettingController,
    ResourcePackageController,
    VeronaModulesController
  ]
})
export class AdminModule {}
