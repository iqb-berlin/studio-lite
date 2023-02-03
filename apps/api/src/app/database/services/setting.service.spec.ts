import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingService } from './setting.service';
import { UsersService } from './users.service';
import Setting from '../entities/setting.entity';

describe('SettingService', () => {
  let service: SettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        {
          provide: UsersService,
          useValue: createMock<UsersService>()
        },
        {
          provide: getRepositoryToken(Setting),
          useValue: createMock<Repository<Setting>>()
        }
      ]
    }).compile();

    service = module.get<SettingService>(SettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
