import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceGroupsController } from './workspace-groups.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    WorkspaceGroupsController
  ]
})
export class WorkspaceGroupsModule {}
