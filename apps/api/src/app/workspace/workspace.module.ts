import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UnitController } from './unit.controller';
import { WorkspaceController } from './workspace.controller';
import { ReviewController } from './review.controller';
import { AppVersionProvider } from '../app-version.guard';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    UnitController,
    WorkspaceController,
    ReviewController
  ],
  providers: [
    AppVersionProvider
  ]
})
export class WorkspaceModule {}
