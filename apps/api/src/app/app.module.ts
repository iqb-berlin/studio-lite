import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { AppVersionProvider } from './guards/app-version.guard';
import { DownloadModule } from './download/download.module';
import { AdminWorkspaceController } from './controllers/admin-workspace.controller';
import { UserController } from './controllers/user.controller';
import { AdminWorkspaceGroupController } from './controllers/admin-workspace-group.controller';
import { SettingController } from './controllers/setting.controller';
import { ResourcePackageController } from './controllers/resource-package.controller';
import { VeronaModuleController } from './controllers/verona-module.controller';
import { ReviewController } from './controllers/review.controller';
import { MetadataProfileController } from './controllers/metadata-profile.controller';
import { WorkspaceGroupController } from './controllers/workspace-group.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.dev',
      cache: true
    }),
    AuthModule,
    DatabaseModule,
    WorkspaceModule,
    DownloadModule,
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
    ReviewController,
    MetadataProfileController,
    WorkspaceGroupController
  ],
  providers: [AppVersionProvider],
  exports: [AppVersionProvider]
})
export class AppModule {}
