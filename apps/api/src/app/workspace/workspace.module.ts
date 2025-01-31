import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UnitController } from './unit.controller';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceReviewController } from './workspace-review.controller';
import { AppVersionProvider } from '../guards/app-version.guard';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    UnitController,
    WorkspaceController,
    WorkspaceReviewController
  ],
  providers: [
    AppVersionProvider
  ]
})
export class WorkspaceModule {}
