import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { MetadataProfileController } from './metadata-profile.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
  controllers: [
    MetadataProfileController
  ]
})
export class MetadataProfileModule {}
