import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import {AuthModule} from "./auth/auth.module";
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
