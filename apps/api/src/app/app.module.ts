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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.dev.local',
      cache: true
    }),
    AdminModule,
    AuthModule,
    DatabaseModule,
    WorkspaceModule,
    ReviewModule,
    MulterModule
  ],
  controllers: [AppController],
  providers: [AppVersionProvider]
})
export class AppModule {}
