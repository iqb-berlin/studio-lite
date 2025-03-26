import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './controllers/app.controller';
import { AppVersionProvider } from './guards/app-version.guard';
import { GroupAdminWorkspaceController } from './controllers/group-admin-workspace.controller';
import { AdminUserController } from './controllers/admin-user-controller';
import { AdminWorkspaceGroupController } from './controllers/admin-workspace-group.controller';
import { SettingController } from './controllers/setting.controller';
import { AdminResourcePackageController } from './controllers/admin-resource-package.controller';
import { AdminVeronaModuleController } from './controllers/admin-verona-module.controller';
import { ReviewController } from './controllers/review.controller';
import { MetadataController } from './controllers/metadata.controller';
import { WorkspaceGroupController } from './controllers/workspace-group.controller';
import { WorkspaceUnitController } from './controllers/workspace-unit.controller';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceReviewController } from './controllers/workspace-review.controller';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import User from './entities/user.entity';
import KeycloakUser from './entities/keycloak-user.entity';
import Workspace from './entities/workspace.entity';
import Unit from './entities/unit.entity';
import WorkspaceGroup from './entities/workspace-group.entity';
import WorkspaceUser from './entities/workspace-user.entity';
import WorkspaceGroupAdmin from './entities/workspace-group-admin.entity';
import VeronaModule from './entities/verona-module.entity';
import UnitDefinition from './entities/unit-definition.entity';
import UnitComment from './entities/unit-comment.entity';
import UnitDropBoxHistory from './entities/unit-drop-box-history.entity';
import MetadataProfile from './entities/metadata-profile.entity';
import MetadataVocabulary from './entities/metadata-vocabulary.entity';
import MetadataProfileRegistry from './entities/metadata-profile-registry.entity';
import RegisteredMetadataProfile from './entities/registered-metadata-profile.entity';
import UnitUser from './entities/unit-user.entity';
import Setting from './entities/setting.entity';
import ResourcePackage from './entities/resource-package.entity';
import Review from './entities/review.entity';
import ReviewUnit from './entities/review-unit.entity';
import { ResourcePackageService } from './services/resource-package.service';
import { UsersService } from './services/users.service';
import { WorkspaceService } from './services/workspace.service';
import { WorkspaceGroupService } from './services/workspace-group.service';
import { WorkspaceUserService } from './services/workspace-user.service';
import { WorkspaceGroupAdminService } from './services/workspace-group-admin.service';
import { UnitService } from './services/unit.service';
import { UnitCommentService } from './services/unit-comment.service';
import { MetadataProfileService } from './services/metadata-profile.service';
import { MetadataVocabularyService } from './services/metadata-vocabulary.service';
import { RegisteredMetadataProfileService } from './services/registered-metadata-profile.service';
import { UnitUserService } from './services/unit-user.service';
import { VeronaModulesService } from './services/verona-modules.service';
import { SettingService } from './services/setting.service';
import { ReviewService } from './services/review.service';
import { WorkspaceUnitCommentController } from './controllers/workspace-unit-comment.controller';
import { ReviewUnitController } from './controllers/review-unit.controller';
import { ReviewUnitCommentController } from './controllers/review-unit-comment.controller';
import { VeronaModuleController } from './controllers/verona-module.controller';
import { ResourcePackageController } from './controllers/resource-package.controller';
import { GroupAdminUserController } from './controllers/group-admin-user-controller';
import { UnitItemController } from './controllers/unit-item.controller';
import { UnitItemService } from './services/unit-item.service';
import UnitItem from './entities/unit-item.entity';
import UnitItemMetadata from './entities/unit-item-metadata.entity';
import UnitMetadata from './entities/unit-metadata.entity';
import { UnitItemMetadataService } from './services/unit-item-metadata.service';
import { UnitItemMetadataController } from './controllers/unit-item-metadata.controller';
import { UnitMetadataService } from './services/unit-metadata.service';
import UnitMetadataToDelete from './entities/unit-metadata-to-delete.entity';
import { UnitMetadataToDeleteService } from './services/unit-metadata-to-delete.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
      cache: true
    }),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' }
      }),
      inject: [ConfigService]
    }),
    HttpModule,
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
    UnitDropBoxHistory,
    MetadataProfile,
    MetadataVocabulary,
    MetadataProfileRegistry,
    RegisteredMetadataProfile,
    UnitUser,
    Setting,
    ResourcePackage,
    Review,
    ReviewUnit,
    UnitItem,
    UnitItemMetadata,
    UnitMetadata,
    UnitMetadataToDelete,
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
          UnitDropBoxHistory,
          MetadataProfile,
          MetadataVocabulary,
          MetadataProfileRegistry,
          RegisteredMetadataProfile,
          UnitUser,
          WorkspaceGroupAdmin,
          Review,
          ReviewUnit,
          UnitItem,
          UnitItemMetadata,
          UnitMetadata,
          UnitMetadataToDelete
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
      UnitDropBoxHistory,
      MetadataProfile,
      MetadataVocabulary,
      MetadataProfileRegistry,
      RegisteredMetadataProfile,
      UnitUser,
      WorkspaceGroupAdmin,
      Review,
      ReviewUnit,
      UnitItem,
      UnitItemMetadata,
      UnitMetadata,
      UnitMetadataToDelete
    ]),
    MulterModule
  ],
  controllers: [
    AppController,
    GroupAdminWorkspaceController,
    AdminUserController,
    GroupAdminUserController,
    AdminWorkspaceGroupController,
    SettingController,
    AdminResourcePackageController,
    ResourcePackageController,
    AdminVeronaModuleController,
    VeronaModuleController,
    WorkspaceController,
    WorkspaceUnitController,
    WorkspaceUnitCommentController,
    WorkspaceReviewController,
    ReviewController,
    ReviewUnitController,
    ReviewUnitCommentController,
    MetadataController,
    WorkspaceGroupController,
    UnitItemController,
    UnitItemMetadataController
  ],
  providers: [
    AppVersionProvider,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ResourcePackageService,
    UsersService,
    WorkspaceService,
    WorkspaceGroupService,
    WorkspaceUserService,
    WorkspaceGroupAdminService,
    UnitService,
    UnitCommentService,
    MetadataProfileService,
    MetadataVocabularyService,
    RegisteredMetadataProfileService,
    UnitUserService,
    VeronaModulesService,
    SettingService,
    ReviewService,
    UnitItemService,
    UnitItemMetadataService,
    UnitMetadataService,
    UnitMetadataToDeleteService
  ],
  exports: [AppVersionProvider]
})
export class AppModule {}
