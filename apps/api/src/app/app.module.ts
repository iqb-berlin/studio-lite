import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuperAdminModule } from './super-admin/super-admin.module';
import {AuthModule} from "./auth/auth.module";
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    SuperAdminModule,
    AuthModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
