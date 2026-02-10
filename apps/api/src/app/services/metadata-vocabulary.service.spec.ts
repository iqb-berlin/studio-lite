import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { MetadataVocabularyService } from './metadata-vocabulary.service';
import MetadataVocabulary from '../entities/metadata-vocabulary.entity';

const mockHttpGet = <T>(httpService: DeepMocked<HttpService>, data: T) => {
  httpService.get.mockReturnValue(
    of({ data }) as unknown as ReturnType<HttpService['get']>
  );
};

describe('MetadataVocabularyService', () => {
  let service: MetadataVocabularyService;
  let metadataVocabularyRepository: DeepMocked<Repository<MetadataVocabulary>>;
  let httpService: DeepMocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetadataVocabularyService,
        {
          provide: getRepositoryToken(MetadataVocabulary),
          useValue: createMock<Repository<MetadataVocabulary>>()
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>()
        }
      ]
    }).compile();

    service = module.get<MetadataVocabularyService>(MetadataVocabularyService);
    metadataVocabularyRepository = module.get(getRepositoryToken(MetadataVocabulary));
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStoredMetadataVocabularyById', () => {
    it('should return stored vocabulary if found', async () => {
      const vocab = new MetadataVocabulary();
      metadataVocabularyRepository.findOneBy.mockResolvedValue(vocab);
      mockHttpGet(httpService, {} as MetadataVocabularyDto);

      const result = await service.getStoredMetadataVocabularyById('id');
      expect(result).toBe(vocab);
    });

    it('should fetch vocabulary if not found', async () => {
      metadataVocabularyRepository.findOneBy.mockResolvedValue(null);
      const vocabDto = { id: 'id' } as MetadataVocabularyDto;
      mockHttpGet(httpService, vocabDto);
      metadataVocabularyRepository.create.mockReturnValue(new MetadataVocabulary());
      metadataVocabularyRepository.save.mockResolvedValue(new MetadataVocabulary());

      const result = await service.getStoredMetadataVocabularyById('id');
      expect(result).toEqual(vocabDto);
    });
  });
});
