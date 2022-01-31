import { Module } from '@nestjs/common';
import {DatabaseModule} from "../database/database.module";
import {AuthModule} from "../auth/auth.module";
import {UnitsController} from "./units.controller";
import { WorkspaceController } from './workspace.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    UnitsController,
    WorkspaceController
  ]
})
export class WorkspaceModule {}
