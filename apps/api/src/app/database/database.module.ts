import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import KeycloakUser from './entities/keycloak-user.entity';
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
import UnitComment from './entities/unit-comment.entity';
import UnitUser from './entities/unit-user.entity';
import { UnitUserService } from './services/unit-user.service';
import { UnitCommentService } from './services/unit-comment.service';
import Review from './entities/review.entity';
import ReviewUnit from './entities/review-unit.entity';
import { ReviewService } from './services/review.service';
import ResourcePackage from './entities/resource-package.entity';
import { ResourcePackageService } from './services/resource-package.service';

@Module({
  imports: [
    User,
    KeycloakUser,
    Workspace,
    Unit,
    WorkspaceGroup,
    WorkspaceUser,
    WorkspaceGroupAdmin,
    VeronaModule,
    UnitDefinition,
    UnitComment,
    UnitUser,
    Setting,
    ResourcePackage,
    Review,
    ReviewUnit,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [
          User,
          KeycloakUser,
          Workspace,
          WorkspaceGroup,
          WorkspaceUser,
          UnitDefinition,
          VeronaModule,
          ResourcePackage,
          Setting,
          Unit,
          UnitComment,
          UnitUser,
          WorkspaceGroupAdmin,
          Review,
          ReviewUnit
        ],
        synchronize: false
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([
      User,
      KeycloakUser,
      Workspace,
      WorkspaceGroup,
      WorkspaceUser,
      UnitDefinition,
      VeronaModule,
      ResourcePackage,
      Setting,
      Unit,
      UnitComment,
      UnitUser,
      WorkspaceGroupAdmin,
      Review,
      ReviewUnit
    ])
  ],
  providers: [
    ResourcePackageService,
    UsersService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceUserService,
    WorkspaceGroupAdminService,
    UnitService,
    UnitCommentService,
    UnitUserService,
    VeronaModulesService,
    SettingService,
    ReviewService
  ],
  exports: [
    User,
    KeycloakUser,
    Unit,
    UnitDefinition,
    UnitComment,
    UnitUser,
    Workspace,
    WorkspaceUser,
    WorkspaceGroup,
    WorkspaceGroupAdmin,
    VeronaModule,
    Setting,
    ResourcePackage,
    ResourcePackageService,
    Review,
    ReviewUnit,
    ReviewService,
    UsersService,
    UnitService,
    UnitCommentService,
    UnitUserService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceGroupAdminService,
    WorkspaceUserService,
    SettingService,
    VeronaModulesService
  ]
})
export class DatabaseModule {}
