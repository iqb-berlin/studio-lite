import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { UnitItemMetadataDto } from '@studio-lite-lib/api-dto';
import { UnitItemService } from './unit-item.service';
import UnitItem from '../entities/unit-item.entity';
import { UnitItemMetadataService } from './unit-item-metadata.service';

describe('UnitItemService', () => {
  let service: UnitItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitItemService,
        {
          provide: getRepositoryToken(UnitItem),
          useValue: createMock<Repository<UnitItem>>()
        },
        {
          provide: UnitItemMetadataService,
          useValue: createMock<UnitItemMetadataService>()
        }
      ]
    }).compile();

    service = module.get<UnitItemService>(UnitItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find', () => {
    const savedProfiles: UnitItemMetadataDto[] = [
      {
        id: 1,
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p11/master/item.json',
        unitItemUuid: '19'
      },
      {
        id: 2,
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/item.json',
        unitItemUuid: '19'
      },
      {
        id: 3,
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p13/master/item.json',
        unitItemUuid: '19'
      }
    ];

    const newProfles: UnitItemMetadataDto[] = [
      {
        id: 1,
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p20/master/item.json',
        unitItemUuid: '19'
      },
      {
        id: 3,
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p13/master/item.json',
        unitItemUuid: '19'
      },
      {
        profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p14/master/item.json',
        unitItemUuid: '20'
      } as UnitItemMetadataDto
    ];

    expect(UnitItemService.compare(savedProfiles, newProfles, 'id'))
      .toEqual(
        {
          unchanged: [
            {
              id: 1,
              profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p20/master/item.json',
              unitItemUuid: '19'
            },
            {
              id: 3,
              profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p13/master/item.json',
              unitItemUuid: '19'
            }
          ],
          removed: [
            {
              id: 2,
              profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p12/master/item.json',
              unitItemUuid: '19'
            }
          ],
          added: [
            {
              id: undefined,
              profileId: 'https://raw.githubusercontent.com/iqb-vocabs/p14/master/item.json',
              unitItemUuid: '20'
            }
          ]
        }
      );
  });
});
