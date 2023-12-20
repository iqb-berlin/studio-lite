import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  providers: [ProfileService],
  controllers: [
    ProfileController
  ]
})
export class ProfileModule {}
