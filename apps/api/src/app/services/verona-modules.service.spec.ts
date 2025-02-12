import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { VeronaModulesService } from './verona-modules.service';
import VeronaModule from '../entities/verona-module.entity';

describe('VeronaModulesService', () => {
  let service: VeronaModulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeronaModulesService,
        {
          provide: getRepositoryToken(VeronaModule),
          useValue: createMock<Repository<VeronaModule>>()
        }
      ]
    }).compile();

    service = module.get<VeronaModulesService>(VeronaModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
