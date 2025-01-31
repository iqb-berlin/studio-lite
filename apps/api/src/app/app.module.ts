import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AppVersionProvider } from './guards/app-version.guard';
import { AdminWorkspaceController } from './controllers/admin-workspace.controller';
import { UserController } from './controllers/user.controller';
import { AdminWorkspaceGroupController } from './controllers/admin-workspace-group.controller';
import { SettingController } from './controllers/setting.controller';
import { ResourcePackageController } from './controllers/resource-package.controller';
import { VeronaModuleController } from './controllers/verona-module.controller';
import { ReviewController } from './controllers/review.controller';
import { MetadataProfileController } from './controllers/metadata-profile.controller';
import { WorkspaceGroupController } from './controllers/workspace-group.controller';
import { DownloadController } from './controllers/download.controller';
import { UnitController } from './controllers/unit.controller';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceReviewController } from './controllers/workspace-review.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
      cache: true
    }),
    AuthModule,
    DatabaseModule,
    MulterModule
  ],
  controllers: [
    AppController,
    AdminWorkspaceController,
    UserController,
    AdminWorkspaceGroupController,
    SettingController,
    ResourcePackageController,
    VeronaModuleController,
    UnitController,
    WorkspaceController,
    WorkspaceReviewController,
    ReviewController,
    MetadataProfileController,
    WorkspaceGroupController,
    DownloadController
  ],
  providers: [AppVersionProvider],
  exports: [AppVersionProvider]
})
export class AppModule {}
