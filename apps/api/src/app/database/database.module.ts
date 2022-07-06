import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { UsersService } from './services/users.service';
import VeronaModule from './entities/verona-module.entity';
import { WorkspaceService } from './services/workspace.service';
import Workspace from './entities/workspace.entity';
import WorkspaceGroup from './entities/workspace-group.entity';
import { WorkspaceGroupService } from './services/workspace-group.service';
import WorkspaceUser from './entities/workspace-user.entity';
import { WorkspaceUserService } from './services/workspace-user.service';
import { VeronaModulesService } from './services/verona-modules.service';
import Setting from './entities/setting.entity';
import { SettingService } from './services/setting.service';
import Unit from './entities/unit.entity';
import { UnitService } from './services/unit.service';
import UnitDefinition from './entities/unit-definition.entity';
import WorkspaceGroupAdmin from './entities/workspace-group-admin.entity';
import { WorkspaceGroupAdminService } from './services/workspace-group-admin.service';

@Module({
  imports: [
    User,
    Workspace,
    Unit,
    WorkspaceGroup,
    WorkspaceUser,
    WorkspaceGroupAdmin,
    VeronaModule,
    UnitDefinition,
    Setting,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'superdb',
        password: 'jfsdssfdfmsdp9fsumdpfu3094umt394u3',
        database: 'studio-lite',
        entities: [User, Workspace, WorkspaceGroup, WorkspaceUser,
          UnitDefinition, VeronaModule, Setting, Unit, WorkspaceGroupAdmin],
        synchronize: false
      })
    }),
    TypeOrmModule.forFeature([User, Workspace, WorkspaceGroup, WorkspaceUser,
      UnitDefinition, VeronaModule, Setting, Unit, WorkspaceGroupAdmin])
  ],
  providers: [
    UsersService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceUserService,
    WorkspaceGroupAdminService,
    UnitService,
    VeronaModulesService,
    SettingService
  ],
  exports: [
    User,
    Unit,
    UnitDefinition,
    Workspace,
    WorkspaceUser,
    WorkspaceGroup,
    WorkspaceGroupAdmin,
    VeronaModule,
    Setting,
    UsersService,
    UnitService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceGroupAdminService,
    WorkspaceUserService,
    SettingService,
    VeronaModulesService
  ]
})
export class DatabaseModule {}
