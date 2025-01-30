import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ReviewModule } from './review/review.module';
import { AppVersionProvider } from './guards/app-version.guard';
import { DownloadModule } from './download/download.module';
import { WorkspaceGroupsModule } from './workspace-groups/workspace-groups.module';
import { MetadataProfileModule } from './metadata-profile/metadata-profile.module';
import { AdminWorkspaceController } from './controllers/admin-workspace.controller';
import { UserController } from './controllers/user.controller';
import { WorkspaceGroupController } from './controllers/workspace-group.controller';
import { SettingController } from './controllers/setting.controller';
import { ResourcePackageController } from './controllers/resource-package.controller';
import { VeronaModulesController } from './controllers/verona-modules.controller';

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
    ReviewModule,
    DownloadModule,
    MulterModule,
    WorkspaceGroupsModule,
    MetadataProfileModule
  ],
  controllers: [
    AppController,
    AdminWorkspaceController,
    UserController,
    WorkspaceGroupController,
    SettingController,
    ResourcePackageController,
    VeronaModulesController
  ],
  providers: [AppVersionProvider],
  exports: [AppVersionProvider]
})
export class AppModule {}
