import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import {UsersService} from "./services/users.service";
import VeronaModule from "./entities/verona-module.entity";
import {WorkspaceService} from "./services/workspace.service";
import Workspace from "./entities/workspace.entity";
import WorkspaceGroup from "./entities/workspace-group.entity";
import {WorkspaceGroupService} from "./services/workspace-group.service";
import WorkspaceUser from "./entities/workspace-user.entity";
import {WorkspaceUserService} from "./services/workspace-user.service";
import {VeronaModulesService} from "./services/verona-modules.service";
import Setting from "./entities/setting.entity";
import {SettingService} from "./services/setting.service";

@Module({
  imports: [
    User,
    Workspace,
    WorkspaceGroup,
    WorkspaceUser,
    VeronaModule,
    Setting,
    TypeOrmModule.forRootAsync({
        useFactory: () => ({
            "type": "postgres",
            "host": "localhost",
            "port": 5432,
            "username": "superdb",
            "password": "jfsdssfdfmsdp9fsumdpfu3094umt394u3",
            "database": "studio-lite",
            "entities": [User, Workspace, WorkspaceGroup, WorkspaceUser, VeronaModule, Setting],
            "synchronize": false
          })
      }
    ),
    TypeOrmModule.forFeature([User, Workspace, WorkspaceGroup, WorkspaceUser, VeronaModule, Setting])
  ],
  providers: [
    UsersService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceUserService,
    VeronaModulesService,
    SettingService
  ],
  exports: [
    User,
    Workspace,
    WorkspaceUser,
    WorkspaceGroup,
    VeronaModule,
    Setting,
    UsersService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceUserService,
    SettingService,
    VeronaModulesService
  ]
})
export class DatabaseModule {}
