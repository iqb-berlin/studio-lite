import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import {UsersService} from "./services/users.service";
import VeronaModule from "./entities/verona-module.entity";
import {WorkspaceService} from "./services/workspace.service";
import Workspace from "./entities/workspace.entity";
import WorkspaceGroup from "./entities/workspace-group.entity";
import {WorkspaceGroupService} from "./services/workspace-group.service";

@Module({
  imports: [
    User,
    Workspace,
    WorkspaceGroup,
    VeronaModule,
    TypeOrmModule.forRootAsync({
        useFactory: () => ({
            "type": "postgres",
            "host": "localhost",
            "port": 5432,
            "username": "superdb",
            "password": "jfsdssfdfmsdp9fsumdpfu3094umt394u3",
            "database": "studio-lite",
            "entities": [User, Workspace, WorkspaceGroup],
            "synchronize": false
          })
      }
    ),
    TypeOrmModule.forFeature([User, Workspace, WorkspaceGroup])
  ],
  providers: [
    UsersService,
    WorkspaceService,
    WorkspaceGroupService
  ],
  exports: [
    User,
    Workspace,
    WorkspaceGroup,
    VeronaModule,
    UsersService,
    WorkspaceService,
    WorkspaceGroupService
  ]
})
export class DatabaseModule {}
