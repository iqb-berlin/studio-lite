import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { ReviewModule } from './review/review.module';
import { AppVersionProvider } from './app-version.guard';
import { DownloadModule } from './download/download.module';
import { WorkspaceGroupsModule } from './workspace-groups/workspace-groups.module';
import { MetadataProfileModule } from './metadata-profile/metadata-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
      cache: true
    }),
    AdminModule,
    AuthModule,
    DatabaseModule,
    WorkspaceModule,
    ReviewModule,
    DownloadModule,
    MulterModule,
    WorkspaceGroupsModule,
    MetadataProfileModule
  ],
  controllers: [AppController],
  providers: [AppVersionProvider],
  exports: [AppVersionProvider]
})
export class AppModule {}
