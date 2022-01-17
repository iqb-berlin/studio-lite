import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import {UsersService} from "./services/users.service";
import VeronaModule from "./entities/verona-module.entity";

@Module({
  imports: [
    User,
    VeronaModule,
    TypeOrmModule.forRootAsync({
        useFactory: () => ({
            "type": "postgres",
            "host": "localhost",
            "port": 5432,
            "username": "superdb",
            "password": "jfsdssfdfmsdp9fsumdpfu3094umt394u3",
            "database": "studio-lite",
            "entities": [User],
            "synchronize": true
          })
      }
    ),
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    UsersService
  ],
  exports: [
    User,
    VeronaModule,
    UsersService
  ]
})
export class DatabaseModule {}
