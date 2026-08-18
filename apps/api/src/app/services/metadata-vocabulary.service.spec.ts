import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import {
  defer, Observable, of, throwError
} from 'rxjs';
import { MetadataVocabularyDto } from '@studio-lite-lib/api-dto';
import { MetadataVocabularyService } from './metadata-vocabulary.service';
import MetadataVocabulary from '../entities/metadata-vocabulary.entity';

const mockHttpGet = <T>(httpService: DeepMocked<HttpService>, data: T) => {
  httpService.get.mockReturnValue(
    of({ data }) as unknown as ReturnType<HttpService['get']>
  );
};

/**
 * `retry` re-subscribes to the observable `http.get` returned rather than calling
 * `http.get` again, so the attempts have to be counted per subscription.
 * Returns a getter for the number of subscriptions so far.
 */
const mockHttpAttempts = (
  httpService: DeepMocked<HttpService>,
  perAttempt: (attempt: number) => Observable<unknown>
): (() => number) => {
  let attempts = 0;
  httpService.get.mockReturnValue(
    defer(() => {
      attempts += 1;
      return perAttempt(attempts);
    }) as unknown as ReturnType<HttpService['get']>
  );
  return () => attempts;
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

      const result = await service.getStoredMetadataVocabularyById('id');
      expect(result).toEqual(vocabDto);
    });

    it('should retry a failed fetch and return the vocabulary once it succeeds', async () => {
      metadataVocabularyRepository.findOneBy.mockResolvedValue(null);
      const vocabDto = { id: 'id' } as MetadataVocabularyDto;
      const attempts = mockHttpAttempts(httpService, attempt => (
        attempt === 1 ? throwError(() => ({ message: 'socket hang up' })) : of({ data: vocabDto })
      ));

      const result = await service.getStoredMetadataVocabularyById('id');
      expect(result).toEqual(vocabDto);
      expect(attempts()).toBe(2);
    });

    it('should give up after the retries are used up and return null', async () => {
      metadataVocabularyRepository.findOneBy.mockResolvedValue(null);
      const attempts = mockHttpAttempts(
        httpService,
        () => throwError(() => ({ message: 'socket hang up' }))
      );

      const result = await service.getStoredMetadataVocabularyById('id');
      expect(result).toBeNull();
      expect(attempts()).toBe(3);
      expect(metadataVocabularyRepository.upsert).not.toHaveBeenCalled();
    });

    /**
     * The table carries no unique index in the entity alone -- the primary key added in
     * changelog 19.0.0 is what makes "id" a conflict target. Storing through a single
     * upsert is what keeps two parallel requests for the same vocabulary from racing:
     * one of them would otherwise fail on the duplicate key.
     */
    it('should store a fetched vocabulary with one upsert keyed on the id', async () => {
      metadataVocabularyRepository.findOneBy.mockResolvedValue(null);
      const vocabDto = { id: 'id' } as MetadataVocabularyDto;
      mockHttpGet(httpService, vocabDto);

      await service.getStoredMetadataVocabularyById('id');

      expect(metadataVocabularyRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'id', modifiedAt: expect.any(Date) }),
        ['id']
      );
      expect(metadataVocabularyRepository.save).not.toHaveBeenCalled();
    });
  });
});
