import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceGroupController } from './workspace-group.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    WorkspaceGroupController
  ]
})
export class WorkspaceGroupsModule {}
